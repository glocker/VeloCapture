import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";


const STRAVA_AUTH_URL = "https://www.strava.com/oauth/mobile/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";


export async function signInWithStrava() {
const clientId = Constants.expoConfig?.extra?.stravaClientId as string;
const redirectUri = Constants.expoConfig?.extra?.stravaRedirectUri as string;


const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    usePKCE: true,
    scopes: ["read,activity:read_all"],
});


await request.makeAuthUrlAsync({
    authUrl: `${STRAVA_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&approval_prompt=auto&scope=read,activity:read_all`,
});


const result = await request.promptAsync({
    useProxy: false,
});


if (result.type === "success" && result.params.code) {
    // Change code to token in Strava (public exchange allows for confidential clients)
    const tokenRes = await fetch(STRAVA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        client_id: clientId,
        client_secret: process.env.STRAVA_CLIENT_SECRET, // For dev we can inject, for prod - change on backend
        code: result.params.code,
        grant_type: "authorization_code",
    }),
    });
    const token = await tokenRes.json();
    await SecureStore.setItemAsync("strava_token", JSON.stringify(token));
    return token;
}
    throw new Error("Strava auth canceled or failed");
}