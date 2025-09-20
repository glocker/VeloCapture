import Constants from "expo-constants";

const BASE = Constants.expoConfig?.extra?.apiBaseUrl as string;

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