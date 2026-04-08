import React from "react";
import { TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditItemLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* BackButton — always go to wardrobe */}
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/wardrobe")}
        className="w-10 h-10 ml-3 bg-white border border-[#E6E6E6] items-center justify-center"
        style={{ borderRadius: 999 }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </TouchableOpacity>

      {/* Scrollable form  */}
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: 30,
          paddingHorizontal: 12,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>

    </SafeAreaView>
  );
}
