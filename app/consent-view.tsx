import { updateMyConsent } from "@/components/api/consentApi";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ConsentScreen() {
  const { scale } = useFontScale();
  const { refreshConsent } = useAuth();
  const Typography = createTypography(scale);
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await updateMyConsent();
      await refreshConsent();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save consent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      key={scale}
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
    >
      <Text
        style={[
          Typography.body,
          {
            fontSize: Typography.body.fontSize * 0.78,
            letterSpacing: 2,
            color: "#6E6E6E",
          },
        ]}
      >
        PRIVACY CONSENT
      </Text>

      <Text
        style={[
          Typography.header,
          {
            marginTop: 10,
            color: "#000",
          },
        ]}
      >
        Before you continue
      </Text>

      <Text
        style={[
          Typography.body,
          {
            marginTop: 20,
            lineHeight: Typography.body.fontSize * 1.7,
            color: "#222",
          },
        ]}
      >
        WardorAI stores your account details, wardrobe items, outfit history, and preference data
        to provide wardrobe management and personalised recommendations.
        If you wish to use virtual try-on features, we also process your body photos. This data is used solely for the purpose of providing virtual try-on functionality and is not shared with third parties.  
      </Text>

      <Text
        style={[
          Typography.body,
          {
            marginTop: 16,
            lineHeight: Typography.body.fontSize * 1.7,
            color: "#222",
          },
        ]}
      >
        By continuing, you agree to this data being processed for app functionality. You can request
        account deletion later from settings.
      </Text>

      <View className="mt-8">
        <TouchableOpacity
          onPress={handleAccept}
          disabled={saving}
          className="bg-black items-center justify-center"
          style={{ borderRadius: 6, height: 48, opacity: saving ? 0.6 : 1 }}
        >
          <Text
            style={[
              Typography.body,
              {
                fontSize: Typography.body.fontSize * 0.82,
                letterSpacing: 2,
                color: "#fff",
              },
            ]}
          >
            {saving ? "SAVING..." : "I AGREE"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}