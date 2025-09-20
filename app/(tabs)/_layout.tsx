import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs>
        <Tabs.Screen name="home" options={{ title: "Map" }} />
        <Tabs.Screen name="stats" options={{ title: "Stats" }} />
        <Tabs.Screen name="leaderboard" options={{ title: "Top" }} />
        </Tabs>
    );
}