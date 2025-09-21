import { ExpoConfig } from "expo-config";

const config: ExpoConfig = {
    name: "VeloCapture",
    slug: "velo-capture",
    scheme: "myapp",
    extra: {
        apiBaseUrl: "http://localhost:8000",
        stravaClientId: process.env.STRAVA_CLIENT_ID,
        stravaRedirectUri: "myapp://redirect",
    },
    ios: {
        bundleIdentifier: "com.example.velocapture",
    },
};

export default config;