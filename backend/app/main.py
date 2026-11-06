from datetime import time
from typing import Annotated

import pymysql
from fastapi import FastAPI, HTTPException, Query

from app.db import get_db_connection

app = FastAPI()


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


@app.get("/courses")
def courses(
    semester_id: Annotated[list[int], Query()],
    subject_code: Annotated[list[str] | None, Query()] = None,
    course_number: int | None = None,
    days: int | None = None,
    ge_category_id: Annotated[list[int] | None, Query()] = None,
    units: Annotated[list[int] | None, Query()] = None,
    early_start_time: time | None = None,
    late_start_time: time | None = None,
    asynchronous: bool | None = None,
    location: str | None = None,
    only_open_classes: bool = False,
):
    # Repeated semester_id parameters arrive as a list. Remove duplicates.
    semester_id = list(dict.fromkeys(semester_id))

    if subject_code is not None:
        subject_code = list(dict.fromkeys(subject_code))

    if ge_category_id is not None:
        ge_category_id = list(dict.fromkeys(ge_category_id))

    if units is not None:
        units = list(dict.fromkeys(units))

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            # Validate semester IDs
            placeholders = ", ".join(["%s"] * len(semester_id))

            cursor.execute(
                f"""
                SELECT semester_id
                FROM semesters
                WHERE semester_id IN ({placeholders})
                """,
                tuple(semester_id),
            )
            existing_ids = {row["semester_id"] for row in cursor.fetchall()}

            missing_ids = [sid for sid in semester_id if sid not in existing_ids]

            if missing_ids:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": "Invalid semester ID(s).",
                        "invalid_semester_ids": missing_ids,
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
            placeholders = ", ".join(["%s"] * len(semester_id))
            conditions.append(f"s.semester_offered_id IN ({placeholders})")
            parameters.extend(semester_id)

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
                # TODO: Update asynchronous to be 0 bits
                if days < 1 or days > valid_day_mask:
                    raise HTTPException(
                        status_code=422,
                        detail={
                            "message": "Invalid meeting day mask.",
                            "valid_range": "0-127",
                        },
                    )

                # Match sections that meet on ALL selected days.
                conditions.append("(s.meeting_days & %s) = %s")
                parameters.extend([days, days])

            # Optional earliest start time.
            if early_start_time is not None:
                conditions.append("s.start_time >= %s")
                parameters.append(early_start_time.strftime("%H:%M:%S"))

            # Optional latest start time.
            if late_start_time is not None:
                conditions.append("s.start_time <= %s")
                parameters.append(late_start_time.strftime("%H:%M:%S"))

            # Asynchronous sections have NULL start and end times.
            if asynchronous is True:
                conditions.append("s.start_time IS NULL AND s.end_time IS NULL")
            elif asynchronous is False:
                conditions.append("s.start_time IS NOT NULL AND s.end_time IS NOT NULL")

            # Optional location search.
            if location:
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
                        "instructor": {
                            "instructor_id": row["instructor_id"],
                            "name": row["instructor_name"],
                            "rating": row["instructor_rating"],
                        },
                        "meeting_days": row["meeting_days"],
                        "start_time": (
                            str(row["start_time"])
                            if row["start_time"] is not None
                            else None
                        ),
                        "end_time": (
                            str(row["end_time"])
                            if row["end_time"] is not None
                            else None
                        ),
                        "asynchronous": (
                            row["start_time"] is None and row["end_time"] is None
                        ),
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
