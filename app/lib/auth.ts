import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// "https://www.strava.com/oauth/authorize" for web
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/mobile/authorize";

export async function signInWithStrava() {
  const clientId = String(Constants.expoConfig?.extra?.stravaClientId);
  // Create redirectUri from scheme to match
  // Custom scheme don't work in Expo Go to return from browser to js bundle
  // So we use proxy
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  // Strava use list separated by commas
  const scope = "read,activity:read_all";

  // Request code
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    // expo require array, but Strava inside read string
    scopes: [scope],
  });

  const authUrl =
    `${STRAVA_AUTH_URL}` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&approval_prompt=auto&scope=${encodeURIComponent(scope)}`;

  await request.makeAuthUrlAsync({ authUrl });

  const result = await request.promptAsync({ useProxy: true });

  if (result.type !== "success" || !result.params?.code) {
    throw new Error("Strava auth canceled or failed");
  }

  // Put code and code_verifier to backend to get token
  const r = await fetch(`${Constants.expoConfig?.extra?.apiBaseUrl}/auth/strava/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: result.params.code,
      redirect_uri: redirectUri,
      code_verifier: request.codeVerifier, // if supports let server use
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Exchange failed: ${r.status} ${txt}`);
  }

  const token = await r.json();
  await SecureStore.setItemAsync("strava_token", JSON.stringify(token));
  return token;
}
