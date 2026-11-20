from datetime import datetime, time
from typing import Annotated

import pymysql
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import PositiveInt

from app.db import get_db_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
)


@app.get("/")
def root():
    return {"message": "OurSDSU backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-health")
def db_health():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 AS connected")
            result = cursor.fetchone()

        return result
    except pymysql.MySQLError as error:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to the local MySQL database.",
        ) from error
    finally:
        if connection is not None:
            connection.close()


# Actually turn the meeting day bit mask to a string of days
def decode_meeting_days(day_mask: int) -> list[str]:
    if day_mask == 0:
        return ["Asynchronous"]

    days = [
        (1, "Monday"),
        (2, "Tuesday"),
        (4, "Wednesday"),
        (8, "Thursday"),
        (16, "Friday"),
        (32, "Saturday"),
        (64, "Sunday"),
    ]

    return [  # Check values return the day names
        day_name for bit, day_name in days if day_mask & bit
    ]


@app.get("/courses")
def courses(
    semester_id: Annotated[list[PositiveInt], Query()],
    subject_code: Annotated[list[str] | None, Query()] = None,
    course_number: int | None = None,
    days: Annotated[int, Query(ge=0, le=127)] | None = None,
    ge_category_id: Annotated[list[int] | None, Query()] = None,
    units: Annotated[list[int] | None, Query()] = None,
    early_start_time: time | None = None,
    late_start_time: time | None = None,
    location: Annotated[str | None, Query(pattern="^(online|in_person)$")] = None,
    only_open_classes: bool = False,
):
    # Reject multiple semester IDs
    if len(semester_id) != 1:
        raise HTTPException(
            status_code=422,
            detail="Only one semester_id is allowed.",
        )

    # Convert the single-item list back into an integer
    semester_id = semester_id[0]

    # Remove duplicates.
    if subject_code is not None:
        subject_code = list(dict.fromkeys(subject_code))

    if ge_category_id is not None:
        ge_category_id = list(dict.fromkeys(ge_category_id))

    if units is not None:
        units = list(dict.fromkeys(units))

    # Reject times with timezones attached to them because cannot compare with non-timezone times
    if early_start_time is not None and early_start_time.tzinfo is not None:
        raise HTTPException(
            status_code=422,
            detail="Timezone information is not allowed for early_start_time.",
        )

    if late_start_time is not None and late_start_time.tzinfo is not None:
        raise HTTPException(
            status_code=422,
            detail="Timezone information is not allowed for late_start_time.",
        )

    # Validate time range.
    if (
        early_start_time is not None
        and late_start_time is not None
        and early_start_time
        > late_start_time  # Make sure early start time is actually earlier
    ):
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Invalid time range.",
                "early_start_time": str(early_start_time),
                "late_start_time": str(late_start_time),
            },
        )
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT semester_id
                FROM semesters
                WHERE semester_id = %s
                """,
                (semester_id,),
            )

            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": "Invalid semester ID.",
                        "invalid_semester_id": semester_id,
                    },
                )

            # Build SQL query
            query = """
                SELECT
                    c.course_id,
                    c.subject_code,
                    c.course_number,
                    c.course_name,
                    c.course_description,
                    c.prerequisites,
                    c.units,
                    gc.ge_category_id,
                    gc.ge_category_code,
                    gc.ge_category,
                    s.section_id,
                    s.semester_offered_id AS semester_id,
                    sem.semester_name,
                    sem.year,
                    i.instructor_id,
                    i.instructor_name,
                    i.instructor_rating,
                    s.meeting_days,
                    s.start_time,
                    s.end_time,
                    s.class_location,
                    s.current_enrollment,
                    s.max_enrollment,
                    s.waitlist_size,
                    s.max_enrollment - s.current_enrollment
                        AS available_seats
                FROM courses c
                JOIN sections s
                    ON c.course_id = s.course_id
                JOIN semesters sem
                    ON s.semester_offered_id = sem.semester_id
                JOIN instructors i
                    ON s.instructor_id = i.instructor_id
                LEFT JOIN ge_categories gc
                    ON c.ge_coverage = gc.ge_category_id
            """

            conditions = []
            parameters = []

            # Required filter for semester
            conditions.append("s.semester_offered_id = %s")
            parameters.append(semester_id)

            # Optional subject codes.
            if subject_code:
                placeholders = ", ".join(["%s"] * len(subject_code))
                conditions.append(f"c.subject_code IN ({placeholders})")
                parameters.extend(subject_code)

            # Optional course number.
            if course_number is not None:
                conditions.append("c.course_number = %s")
                parameters.append(course_number)

            # Optional GE category IDs.
            if ge_category_id:
                placeholders = ", ".join(["%s"] * len(ge_category_id))
                conditions.append(f"gc.ge_category_id IN ({placeholders})")
                parameters.extend(ge_category_id)

            # Optional unit counts.
            if units:
                placeholders = ", ".join(["%s"] * len(units))
                conditions.append(f"c.units IN ({placeholders})")
                parameters.extend(units)

            # Optional meeting days.
            # Bit values: Asynchronous=0, Mon=1, Tue=2, Wed=4, Thu=8,
            # Fri=16, Sat=32, Sun=64.
            if days is not None:
                valid_day_mask = 127
                if days < 0 or days > valid_day_mask:
                    raise HTTPException(
                        status_code=422,
                        detail={
                            "message": "Invalid meeting day mask.",
                            "valid_range": "0-127",
                        },
                    )

                if days == 0:
                    conditions.append("s.meeting_days = 0")
                else:
                    conditions.append("s.meeting_days = %s")
                    parameters.append(days)

            # Optional earliest start time.
            if early_start_time is not None:
                conditions.append("s.start_time >= %s")
                parameters.append(early_start_time.strftime("%H:%M:%S"))

            # Optional latest start time.
            if late_start_time is not None:
                conditions.append("s.start_time <= %s")
                parameters.append(late_start_time.strftime("%H:%M:%S"))

            # Optional location search.
            if location:
                location = location.strip().lower()

                if location == "in_person":  # Handle in person classes
                    conditions.append(
                        "s.class_location IS NOT NULL "
                        "AND LOWER(s.class_location) NOT LIKE %s"
                    )
                    parameters.append("%online%")
                elif location == "online":  # Handle online classes
                    conditions.append("LOWER(s.class_location) LIKE %s")
                    parameters.append("%online%")
                else:
                    conditions.append("s.class_location LIKE %s")
                    parameters.append(f"%{location}%")

            # Optional open-seat filter.
            if only_open_classes:
                conditions.append("s.current_enrollment < s.max_enrollment")

            query += "\nWHERE " + "\n AND ".join(conditions)
            query += "\nORDER BY c.subject_code, c.course_number"

            cursor.execute(query, tuple(parameters))
            rows = cursor.fetchall()

            # Group sections under each course
            results_by_course = {}

            for row in rows:
                course_id = row["course_id"]

                if course_id not in results_by_course:
                    results_by_course[course_id] = {
                        "course_id": course_id,
                        "subject_code": row["subject_code"],
                        "course_number": row["course_number"],
                        "course_name": row["course_name"],
                        "course_description": row["course_description"],
                        "prerequisites": row["prerequisites"],
                        "units": row["units"],
                        "ge_category": {
                            "id": row["ge_category_id"],
                            "code": row["ge_category_code"],
                            "name": row["ge_category"],
                        }
                        if row["ge_category_id"] is not None
                        else None,
                        "sections": [],
                    }

                results_by_course[course_id]["sections"].append(
                    {
                        "section_id": row["section_id"],
                        "semester_id": row["semester_id"],
                        "semester_name": row["semester_name"],
                        "year": row["year"],
                        "instructor_id": row["instructor_id"],
                        "instructor_name": row["instructor_name"],
                        "instructor_rating": row["instructor_rating"],
                        "meeting_days": decode_meeting_days(row["meeting_days"]),
                        "start_time": (
                            (datetime.min + row["start_time"]).strftime("%H:%M:%S")
                            if row["start_time"] is not None
                            else None
                        ),
                        "end_time": (
                            (datetime.min + row["end_time"]).strftime("%H:%M:%S")
                            if row["end_time"] is not None
                            else None
                        ),
                        "asynchronous": row["meeting_days"] == 0,
                        "class_location": row["class_location"],
                        "current_enrollment": row["current_enrollment"],
                        "max_enrollment": row["max_enrollment"],
                        "available_seats": row["available_seats"],
                        "waitlist_size": row["waitlist_size"],
                    }
                )

            return {"results": list(results_by_course.values())}

    except HTTPException:
        raise

    except pymysql.MySQLError as error:
        raise HTTPException(
            status_code=503,
            detail="Could not search courses in the local MySQL database.",
        ) from error

    finally:
        if connection is not None:
            connection.close()


@app.get("/semesters")  # Used to return all of the semesters that exist in the database
def semesters():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:  # Order by year/season (descending)
            cursor.execute(""" 
                SELECT semester_id, semester_name, year
                FROM semesters
                ORDER BY
                    year DESC,
                    CASE semester_name
                        WHEN 'Winter' THEN 1
                        WHEN 'Spring' THEN 2
                        WHEN 'Summer' THEN 3
                        WHEN 'Fall' THEN 4
                    END DESC
                """)

            rows = cursor.fetchall()

        results_by_semester = []

        for row in rows:  # Add all the semester data to the list to later be returned
            results_by_semester.append(
                {
                    "semester_id": row["semester_id"],
                    "semester_name": row["semester_name"],
                    "year": row["year"],
                }
            )

        return {"results": results_by_semester}

    except HTTPException:
        raise

    except pymysql.MySQLError as error:
        raise HTTPException(
            status_code=503,
            detail="Could not search semesters in the local MySQL database.",
        ) from error

    finally:
        if connection is not None:
            connection.close()


@app.get(
    "/ge_categories"
)  # Used to return all of the ge_categories that exist in the database
def ge_categories():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:  # Order by ge_category_code (ascending)
            cursor.execute(""" 
                SELECT ge_category_id, ge_category_code, ge_category
                FROM ge_categories
                ORDER BY ge_category_code ASC
            """)

            rows = cursor.fetchall()

        results_by_ge_category = []

        for (
            row
        ) in rows:  # Add all the ge_category data to the list to later be returned
            results_by_ge_category.append(
                {
                    "ge_category_id": row["ge_category_id"],
                    "ge_category_code": row["ge_category_code"],
                    "ge_category": row["ge_category"],
                }
            )

        return {"results": results_by_ge_category}

    except HTTPException:
        raise

    except pymysql.MySQLError as error:
        raise HTTPException(
            status_code=503,
            detail="Could not search ge_categories in the local MySQL database.",
        ) from error

    finally:
        if connection is not None:
            connection.close()
