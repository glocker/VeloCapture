from typing import Optional
import jwt, time, os, httpx, psycopg
from psycopg.rows import dict_row
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
DB_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")
JWT_ALG = "HS256"
JWT_EXP = 60 * 60 * 24 * 7

def get_conn():
    return psycopg.connect(DB_URL, row_factory=dict_row)

@router.get("/callback", response_class=HTMLResponse)
async def strava_callback(request: Request, code: str, state: Optional[str] = None):
    # Convert code -> token
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            STRAVA_TOKEN_URL,
            json={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                # redirect_uri should be same as in auth
                "redirect_uri": str(request.url.replace(query="").replace(path="/auth/strava/callback")),
            },
            timeout=15.0,
        )
    print("Strava token exchange status:", resp.status_code, resp.text)

    if resp.status_code != 200:
        return HTMLResponse(f"<h1>Auth failed</h1><pre>{resp.text}</pre>", status_code=400)

    token_data = resp.json()
    athlete = token_data.get("athlete", {})
    strava_id = athlete.get("id")

    # upsert user
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (strava_id, display_name)
                VALUES (%s, %s)
                ON CONFLICT (strava_id) DO UPDATE
                SET display_name = EXCLUDED.display_name
                RETURNING id
                """,
                (strava_id, athlete.get("username") or athlete.get("firstname")),
            )
            user_id = cur.fetchone()["id"]

    # generating JWT
    now = int(time.time())
    jwt_token = jwt.encode({"sub": str(user_id), "iat": now, "exp": now + JWT_EXP}, JWT_SECRET, algorithm=JWT_ALG)

    # return to app: if get state (exp://...), redirect there
    target = state or str(request.url_for("auth_complete"))
    sep = "&" if ("?" in target) else "?"
    html = f"""
    <html><body>
      <script>
        window.location.replace("{target}{sep}jwt={jwt_token}");
      </script>
    </body></html>
    """
    return HTMLResponse(html)

@router.get("/complete", response_class=HTMLResponse, name="auth_complete")
async def auth_complete(jwt: str):
    return HTMLResponse("<h1>✅ You can return to the app</h1>")