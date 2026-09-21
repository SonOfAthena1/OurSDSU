from fastapi import FastAPI, HTTPException
import pymysql

from backend.app.db import get_db_connection

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