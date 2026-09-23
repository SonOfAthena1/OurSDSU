import os
from pathlib import Path

from dotenv import load_dotenv
import pymysql

load_dotenv(
    Path(__file__).resolve().parents[1] / ".env",
    override=True,
)

def get_db_connection():
    return pymysql.connect(
        host = os.environ["DB_HOST"],
        port = int(os.environ["DB_PORT"]),
        user = os.environ["DB_USER"],
        password = os.environ["DB_PASSWORD"],
        database = os.environ["DB_NAME"],
        cursorclass = pymysql.cursors.DictCursor,
        connect_timeout = 5,
    )