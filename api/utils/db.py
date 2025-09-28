import os, psycopg
from psycopg.rows import dict_row

DB_URL = os.getenv("DATABASE_URL")

def get_conn():
    return psycopg.connect(DB_URL, row_factory=dict_row)
