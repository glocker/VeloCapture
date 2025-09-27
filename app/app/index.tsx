import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signInWithStrava } from "../lib/auth";

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>VeloCapture</Text>
      <Pressable
        onPress={async () => {
          try {
            const jwt = await signInWithStrava(); // кладёт токен, возвращает jwt
            console.log("JWT saved:", jwt);
            // после закрытия SafariView просто переходим
            //setTimeout(() => router.replace("/(tabs)/home"), 50);
          } catch (e) {
            console.error(e);
            Alert.alert("Login failed", String(e));
          }
        }}
        style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#fc4c02", borderRadius: 12 }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Log in with Strava</Text>
      </Pressable>
    </View>
  );
}