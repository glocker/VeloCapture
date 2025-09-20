import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Providers
export default function RootLayout() {
    const [qc] = useState(() => new QueryClient());
    return (
    <QueryClientProvider client={qc}>
    <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
    );
}