import { Stack, useRouter, usePathname } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export default function RootLayout() {
  const [qc] = useState(() => new QueryClient());
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // <--- чтобы не делать redirect, если уже на home

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const jwt = await SecureStore.getItemAsync("jwt_token");
      if (jwt && isMounted && pathname === "/") {
        console.log("🔑 Found saved JWT, redirecting to /home");
        router.replace("/(tabs)/home");
      }
      setChecking(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) return null;

  return (
    <QueryClientProvider client={qc}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
