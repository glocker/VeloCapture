import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const BASE = Constants.expoConfig?.extra?.apiBaseUrl as string;

// Click Sync on main screen
export async function syncActivities() {
  try {
    const jwt = await SecureStore.getItemAsync("jwt_token");
    if (!jwt) throw new Error("Not logged in");

    const res = await fetch(`${Constants.expoConfig?.extra?.apiBaseUrl}/auth/strava/sync`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    alert(`Imported: ${data.imported} activities, new cells: ${data.cells_added}`);
  } catch (e) {
    console.error(e);
    alert("Synchronisation error");
  }
}

export async function importActivity(payload: any) {
    const r = await fetch(`${BASE}/activities/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    });
    return r.json();
}


export async function getCells(userId: string) {
    const r = await fetch(`${BASE}/cells/by-bbox?user_id=${userId}`);
    return r.json();
}


export async function getLeaderboard() {
    const r = await fetch(`${BASE}/leaderboard`);
    return r.json();
}