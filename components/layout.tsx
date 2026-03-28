import BackButton from "@/components/backButton";
import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* BackButton */}
      <BackButton />

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
