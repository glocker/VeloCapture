import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthPage } from "@/pages/auth/AuthPage";
import { MapPage } from "@/pages/map/MapPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";

export type RootStackParamList = {
  Auth: undefined;
  Map: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthPage} />
      <Stack.Screen name="Map" component={MapPage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
    </Stack.Navigator>
  );
};
