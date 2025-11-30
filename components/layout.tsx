import BackButton from "@/components/backButton";
import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditItemLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-[#723d46]">

      {/* BackButton with */}
      <BackButton containerStyle={{ marginTop: 0, marginBottom: 0 }} />

      {/* Scrollable form  */}
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: 30,
          paddingHorizontal: 12,
        }}
        keyboardShouldPersistTaps="handled" // Controls how taps are handled when the keyboard is open.
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>

    </SafeAreaView>
  );
}
