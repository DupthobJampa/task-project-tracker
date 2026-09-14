import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        dbname="task_tracker",
        cursor_factory=RealDictCursor
    )
