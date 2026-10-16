from typing import Annotated

import pymysql
from fastapi import FastAPI, HTTPException, Query
from pydantic import PositiveInt

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
    semester_id: Annotated[list[PositiveInt], Query(min_length=1)],
    only_open_classes: bool = False,
    #TODO Add more potential inputs
):
    # Repeated semester_id parameters arrive as a list. Remove duplicates.
    semester_id = list(dict.fromkeys(semester_id))
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            # TODO SQL Here: check that every ID in semester_id exists.
            # Raise HTTPException(status_code=422, detail=...) if one does not.

            # TODO SQL Here: fetch sections in semester_id.
            # If only_open_classes is True, include only sections with space.
            # Pass query values separately to cursor.execute(query, parameters).
            # Then read the rows with cursor.fetchall().
            pass # Temp placeholder
            rows = cursor.fetchall()

        # TODO: group the fetched rows by course_id and build each sections list.
        # This is an empty placeholder until the query and formatting are added.
        results = [] # Build this using rows.
        return {"results": results}
    
    except pymysql.MySQLError as error:
        raise HTTPException(
            status_code=503,
            detail="Could not search courses in the local MySQL database.",
        ) from error
    finally:
        if connection is not None:
            connection.close()
