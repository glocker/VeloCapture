import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ExchangeIn(BaseModel):
    code: str
    redirect_uri: str
    code_verifier: str | None = None  # for future (if provider supports PKCE)

STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"

@router.post("/exchange")
async def exchange_code(body: ExchangeIn):
    client_id = os.environ["STRAVA_CLIENT_ID"]
    client_secret = os.environ["STRAVA_CLIENT_SECRET"]

    # Strava awaits x-www-form-urlencoded
    form = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": body.code,
        "grant_type": "authorization_code",
        "redirect_uri": body.redirect_uri,
        # PKCE param doesn't written in Strava docs; leave it here for future:
        # "code_verifier": body.code_verifier or "",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(STRAVA_TOKEN_URL, data=form, timeout=20.0)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    token = resp.json()
    # token include athlete (object) — there's strava user id
    # можешь здесь же создать/обновить пользователя в БД и вернуть { user_id, ... }
    return token
