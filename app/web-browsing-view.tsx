import BackButton from "@/components/backButton";
import ScreenHelpButton from "@/components/screenHelpButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot, { captureScreen } from "react-native-view-shot";
import { WebView } from "react-native-webview";
import { useImages } from "../context/ImageContext";

export default function WebBrowserScreen() {
  const { url } = useLocalSearchParams();
  const { addImages } = useImages();
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);

  const captureWeb = async () => {
  try {
    //  WebView content
    const uri = await captureScreen({
      format: "jpg",
      quality: 0.95,
    });

    if (!uri) return;

    await addImages(uri);
    Alert.alert("Captured!", "Image added to your gallery.");
  } catch (e) {
    console.error(e);
    Alert.alert("Error", "Could not capture the screen.");
  }
};


  return (
  <SafeAreaView className="flex-1 bg-white">
    {/* Top bar */}
    <View className="pt-2 px-4 pb-3 border-b border-[#E6E6E6] bg-white flex-row items-center justify-between">
      <BackButton fallbackHref="/saved-sites-view" />
      <Text className="text-[12px] tracking-[2px] text-black">WEB CAPTURE</Text>
      <ScreenHelpButton
        title="Web Capture"
        subtitle="Browse a page and save a screenshot into your image gallery."
        items={[
          "Browse the page until the clothing item is clearly visible.",
          "Tap CAPTURE to save the current web view as an image.",
          "Use DONE to return to the gallery after you finish capturing.",
          "Use CANCEL if you want to leave without saving anything.",
        ]}
      />
    </View>

    {/* WebView */}
    <View className="flex-1">
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.95 }} style={{ flex: 1 }}>
        <WebView source={{ uri: url as string }} style={{ flex: 1, backgroundColor: "white" }} />
      </ViewShot>
    </View>

    {/* Bottom bar */}
    <View className="px-4 py-3 border-t border-[#E6E6E6] bg-white flex-row items-center justify-between">
      <TouchableOpacity
        onPress={() => router.back()}
        className="border border-[#E6E6E6] bg-white px-4 py-3"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-[12px] tracking-[1px] text-black">CANCEL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={captureWeb}
        className="border border-black bg-white px-6 py-3"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-[12px] tracking-[1.5px] text-black">CAPTURE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/image-gallery-view")}
        className="border border-[#E6E6E6] bg-white px-4 py-3"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-[12px] tracking-[1px] text-black">DONE</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);
}