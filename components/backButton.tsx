import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="absolute top-12 left-5 p-2 rounded-full"
    >
      <Ionicons name="chevron-back" size={26} color="#050605ff" />
    </TouchableOpacity>
  );
}
