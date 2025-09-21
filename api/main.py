from fastapi import FastAPI, Depends, HTTPException, Query
from pydantic import BaseModel
import os, math, datetime as dt
import polyline as poly
import psycopg
from psycopg.rows import dict_row
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from auth_strava import router as strava_router

load_dotenv()
app = FastAPI()
app.include_router(strava_router, prefix="/auth/strava")

# enable CORS for Expo/Web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ["http://localhost:8081", "exp://*", "http://127.0.0.1:*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_URL = os.getenv("DATABASE_URL")
Z = int(os.getenv("GRID_ZOOM", 18))
CELL_SIZE_M = int(os.getenv("GRID_STEP_M", 100))

# --- DB utils ---

def get_conn():
    return psycopg.connect(DB_URL, row_factory=dict_row)

# --- Models ---
class ActivityIn(BaseModel):
    user_id: str
    strava_activity_id: int
    polyline: str
    distance_m: int | None = None
    moving_time_s: int | None = None
    start_date: dt.datetime | None = None

class BBox(BaseModel):
    min_lat: float
    min_lng: float
    max_lat: float
    max_lng: float

# --- Helpers: projection and cell key ---
EARTH_RADIUS = 6378137.0
TILE_SIZE = 256

# Web Mercator utils

def latlng_to_pixel(lat: float, lng: float, zoom: int):
    siny = math.sin(lat * math.pi / 180.0)
    siny = min(max(siny, -0.9999), 0.9999)
    scale = (1 << zoom) * TILE_SIZE
    x = (lng + 180.0) / 360.0 * scale
    y = (0.5 - math.log((1 + siny) / (1 - siny)) / (4 * math.pi)) * scale
    return x, y

def pixel_to_tile(x: float, y: float):
    return int(x // TILE_SIZE), int(y // TILE_SIZE)

def cell_key(lat: float, lng: float, zoom: int) -> str:
    # Convert lat/lng to (x,y) by Z, devide tile by subtiles for CELL_SIZE_M
    # Just use tile coordinates Z (enough for MVP)
    x, y = latlng_to_pixel(lat, lng, zoom)
    tx, ty = pixel_to_tile(x, y)
    return f"{zoom}/{tx}/{ty}"

# Step for ~50 m for polyline by points

def polyline_to_cells(encoded: str, zoom: int) -> set[str]:
    pts = poly.decode(encoded)  # [(lat,lng), ...]
    seen = set()
    for lat, lng in pts:
        seen.add(cell_key(lat, lng, zoom))
    return seen

# --- Endpoints ---

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/activities/import")
def import_activity(body: ActivityIn):
    # Save activity and calculate cells
    cells = polyline_to_cells(body.polyline, Z)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO activities (user_id, strava_activity_id, distance_m, moving_time_s, polyline, start_date)
                VALUES (%s,%s,%s,%s,%s,%s)
                ON CONFLICT (user_id, strava_activity_id) DO NOTHING
                RETURNING id
                """,
                (body.user_id, body.strava_activity_id, body.distance_m, body.moving_time_s, body.polyline, body.start_date)
            )
            # Paste cells (UPSERT)
            for cid in cells:
                cur.execute(
                    """
                    INSERT INTO cells (user_id, cell_id)
                    VALUES (%s,%s)
                    ON CONFLICT (user_id, cell_id) DO NOTHING
                    """,
                    (body.user_id, cid)
                )
            # Calculate stats
            cur.execute("SELECT COUNT(*) AS c FROM cells WHERE user_id=%s", (body.user_id,))
            c = cur.fetchone()["c"]
            area_km2 = c * 0.01  # 100x100 m ~ 0.01 km2
            cur.execute(
                """
                INSERT INTO user_stats (user_id, cells_count, area_km2, updated_at)
                VALUES (%s,%s,%s, now())
                ON CONFLICT (user_id) DO UPDATE
                SET cells_count=EXCLUDED.cells_count, area_km2=EXCLUDED.area_km2, updated_at=now()
                """,
                (body.user_id, c, area_km2)
            )
    return {"imported": True, "cells_added": len(cells)}

@app.get("/cells/by-bbox")
def cells_by_bbox(user_id: str, min_lat: float, min_lng: float, max_lat: float, max_lng: float):
    # MVP: return all user cells (filter by bbox can add later)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT cell_id FROM cells WHERE user_id=%s", (user_id,))
            rows = cur.fetchall()
    return {"cells": [r["cell_id"] for r in rows]}

@app.get("/leaderboard")
def leaderboard(limit: int = 20):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT u.id as user_id, COALESCE(us.cells_count,0) as cells_count, u.display_name, u.color
                FROM users u
                LEFT JOIN user_stats us ON us.user_id=u.id
                ORDER BY cells_count DESC NULLS LAST
                LIMIT %s
                """,
                (limit,)
            )
            rows = cur.fetchall()
    return {"items": rows}