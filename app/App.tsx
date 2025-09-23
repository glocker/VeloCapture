import { Alert, View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { signInWithStrava } from "./lib/auth";

// Auth screen
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
    <Text style={{ fontSize: 24, fontWeight: "600" }}>VeloCapture</Text>
    <Pressable
      onPress={async () => {
        try {
          // Exchange token
          await signInWithStrava();
          router.replace("/(tabs)/home");
        } catch (e) {
          Alert.alert(
            "Log in error",
            e?.message || "Can't log in with Strava. Check connection and application settings."
          );
          console.warn(e);
        }
      }}
      style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#fc4c02", borderRadius: 12 }}
      >
      <Text style={{ color: "white", fontWeight: "600" }}>Log in with Strava</Text>
  </Pressable>
  </View>
  );
}
