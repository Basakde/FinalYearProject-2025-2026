import BackButton from "@/components/backButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

export default function EditItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-[#723d46]">

      {/* BackButton with ZERO margin */}
      <BackButton containerStyle={{ marginTop: 0, marginBottom: 0 }} />

      {/* Scrollable form with very low padding */}
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
