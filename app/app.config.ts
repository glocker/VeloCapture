import { ExpoConfig } from "expo-config";

const config: ExpoConfig = {
name: "Strava Territory",
slug: "strava-territory",
scheme: "myapp",
extra: {
apiBaseUrl: "http://localhost:8000",
stravaClientId: process.env.STRAVA_CLIENT_ID,
stravaRedirectUri: "myapp://redirect",
},
ios: {
bundleIdentifier: "com.example.stravaterritory",
},
};
export default config;