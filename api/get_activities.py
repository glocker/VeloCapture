from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
import httpx

router = APIRouter()

@router.post("/sync")
async def sync_activities(user=Depends(current_user_from_jwt)):
    """
    Синхронизация всех вело-активностей пользователя с Strava.
    """
    # 1. достать refresh_token из users таблицы
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT strava_refresh_token FROM users WHERE id=%s", (user["id"],))
            row = cur.fetchone()
            if not row:
                raise HTTPException(401, "User not found")
            refresh_token = row["strava_refresh_token"]

    # 2. обновить access_token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://www.strava.com/oauth/token",
            json={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            }
        )
    token_data = token_resp.json()
    access_token = token_data["access_token"]

    # 3. загрузить все вело-активности
    async with httpx.AsyncClient() as client:
        activities_resp = await client.get(
            "https://www.strava.com/api/v3/athlete/activities",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"per_page": 50}
        )
    activities = activities_resp.json()
    imported = 0
    cells_added = 0
    for act in activities:
        if act["type"] != "Ride":  # фильтруем только вело
            continue
        body = {
            "user_id": user["id"],
            "strava_activity_id": act["id"],
            "polyline": act["map"]["summary_polyline"],
            "distance_m": act["distance"],
            "moving_time_s": act["moving_time"],
            "start_date": act["start_date"],
        }
        r = await client.post(f"{API_BASE}/activities/import", json=body)
        if r.status_code == 200:
            data = r.json()
            imported += 1
            cells_added += data["cells_added"]

    return JSONResponse({"imported": imported, "cells_added": cells_added})
