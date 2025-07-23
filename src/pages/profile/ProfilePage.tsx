import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const ProfilePage = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Page</Text>
      <Button title="Go to Auth" onPress={() => navigation.navigate("Auth")} />
    </View>
  );
};
