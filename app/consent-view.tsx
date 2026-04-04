import { updateMyConsent } from "@/components/api/consentApi";
import { deleteMyAccount } from "@/components/api/userApi";
import DeleteAccountButton from "@/components/deleteAccountButton";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ConsentScreen() {
  const { scale } = useFontScale();
  const { refreshConsent, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const mainHeadingTextClassName = `text-[${4 * scale * 0.78}px] tracking-[2px] text-[#6E6E6E]`;
  const headingTextClassName = `mt-2.5 text-[${5 * scale}px] uppercase tracking-[1.5px] text-black`;
  const bodyTextClassName = `text-[${4 * scale}px] tracking-[0.2px] leading-[${4 * scale * 1.7}px] text-[#222]`;
  const buttonTextClassName = `text-[${4 * scale * 0.82}px] tracking-[2px] text-white`;

  const handleAccept = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await updateMyConsent();
      await refreshConsent();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save consent");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (deletingAccount) return;

    Alert.alert(
      "Delete account",
      "Do you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingAccount(true);
              await deleteMyAccount();
              await logout();
            } catch (error) {
              console.log("Delete account failed:", error);
              Alert.alert("Error", "Could not delete your account.");
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      key={scale}
      className="flex-1 bg-white"
      contentContainerClassName="px-6 pt-20 pb-10"
    >
      <Text className={mainHeadingTextClassName}>
        PRIVACY CONSENT
      </Text>

      <Text className={headingTextClassName}>
        Before you continue
      </Text>

      <Text className={`mt-5 ${bodyTextClassName}`}>
       WardorAI stores your account details, wardrobe items, outfit history, 
       and preference data to provide wardrobe management and personalised recommendations.
        If you choose to use virtual try-on features, your uploaded image may also be processed for that purpose. 
        This image is used only to provide the virtual try-on functionality. 
        Where required for this feature, the image is securely transmitted to external processing services used by the 
        application and is not used for unrelated purposes.
      </Text>

      <Text className={`mt-4 ${bodyTextClassName}`}>
        By continuing, you agree to this data being processed for app functionality. You can request
        account deletion later from settings.
      </Text>

      <View className="mt-8">
        <TouchableOpacity
          onPress={handleAccept}
          disabled={saving || deletingAccount}
          className={`h-12 items-center justify-center rounded-md bg-black ${saving ? "opacity-60" : "opacity-100"}`}
        >
          <Text className={buttonTextClassName}>
            {saving ? "SAVING..." : "I AGREE"}
          </Text>
        </TouchableOpacity>

        <DeleteAccountButton
          onPress={confirmDeleteAccount}
          disabled={deletingAccount}
          loading={deletingAccount}
          className="mt-3"
          textStyle={{
            fontSize: 4 * scale,
            letterSpacing: 0.5,
          }}
        />
      </View>
    </ScrollView>
  );
}