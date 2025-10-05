import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { getStats } from "../../lib/api";
import { jwtDecode } from "jwt-decode"; // установи пакет: npm i jwt-decode

type JWTPayload = {
  sub: string;
  exp?: number;
  iat?: number;
};

type Stats = {
  cells_count: number;
  area_km2: number;
  total_distance_km: number;
  updated_at?: string;
};

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const jwt = await SecureStore.getItemAsync("jwt_token");
        if (!jwt) {
          Alert.alert("Error", "JWT didn't found. Please authorize again.");
          return;
        }

        // Get user_id from token
        const decoded = jwtDecode<JWTPayload>(jwt);
        const userId = decoded.sub;
        if (!userId) throw new Error("user_id isn't exist in token");

        const data = await getStats(userId);
        setStats(data);
      } catch (e) {
        console.error(e);
        Alert.alert("Error loading", String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fc4c02" />
        <Text style={{ marginTop: 8 }}>Stats loading...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No stats data</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#fc4c02" }}>
        📊 Ваша статистика
      </Text>
      <Text style={{ fontSize: 18 }}>Captured: {stats.cells_count}</Text>
      <Text style={{ fontSize: 18 }}>Square: {stats.area_km2} км²</Text>
      <Text style={{ fontSize: 18 }}>
        Total distance: {stats.total_distance_km} км
      </Text>

      {stats.updated_at && (
        <Text style={{ fontSize: 14, color: "#64748b", marginTop: 10 }}>
          Updated: {new Date(stats.updated_at).toLocaleString()}
        </Text>
      )}
    </View>
  );
}
