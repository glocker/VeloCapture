import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/mobile/authorize";

// Create links from config
const API = String(Constants.expoConfig?.extra?.apiBaseUrl);
const REDIRECT_URI = `${API}/auth/strava/callback`;
const COMPLETE_URI = Linking.createURL("/auth/complete");

// Deep link в Expo Go
const RETURN_URL = Linking.createURL("/auth-done");

export async function signInWithStrava() {
  const clientId = String(Constants.expoConfig?.extra?.stravaClientId);
  const scope = "read,activity:read_all";

  console.log("apiBase:", API);
  console.log("redirectUri:", REDIRECT_URI);
  console.log("completeUri:", COMPLETE_URI);

  const authUrl =
      `${STRAVA_AUTH_URL}?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code&approval_prompt=auto&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(RETURN_URL)}`;

  // Open SafariView. When server redirects to COMPLETE_URI, window close and result return.
  const result = await WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL);
  console.log("WebBrowser result:", result);

  if (result.type !== "success" || !result.url) {
    throw new Error("Auth canceled or failed");
  }

  // Parse JWT from URL
  const jwt = new URL(result.url).searchParams.get("jwt");

  if (!jwt) throw new Error("No JWT in callback");

  await SecureStore.setItemAsync("jwt_token", jwt);

  return jwt;
}