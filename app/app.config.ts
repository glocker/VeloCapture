import * as path from "path";
import * as fs from "fs";
import dotenv from "dotenv";
import { ExpoConfig } from "expo-config";

// Manually load .env from api folder
const envPath = path.resolve(__dirname, "../api/.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const config: ExpoConfig = {
    name: "VeloCapture",
    owner: "glocker",
    slug: "velocapture",
    scheme: "myapp",
    extra: {
        apiBaseUrl: `http://${process.env.MAC_IP}:8000`,
        stravaClientId: process.env.STRAVA_CLIENT_ID,
        stravaRedirectUri: "myapp://redirect"
        // eas: {
        //     projectId: "800406c7-5c9b-49e0-9c34-80811524fd9e"
        // }
    },
    ios: {
        bundleIdentifier: "com.example.velocapture",
    },
};

export default config;