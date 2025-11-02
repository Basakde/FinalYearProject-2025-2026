import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { WebView } from "react-native-webview";
import { useImages } from "../context/ImageContext";

export default function WebBrowserScreen() {
  const { url } = useLocalSearchParams();
  const { addImages } = useImages();
  const router = useRouter();
  const viewShotRef = useRef<any>(null);

  const captureWeb = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert("Error", "Unable to capture view.");
        return;
      }
      const uri = await viewShotRef.current.capture();
      addImages(uri); // ✅ store image in global context
      Alert.alert("Captured!", "Image added to your gallery.");
      router.replace("/image-gallery-view"); // optional: auto-navigate back to gallery
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1">
        <ViewShot
            ref={viewShotRef}
            options={{ format: "jpg", quality: 0.9 }}
            style={{ flex: 1 }}
        >
            <WebView source={{ uri: url as string }} style={{ flex: 1 }} />
        </ViewShot>

        <View className="bg-black justify-center items-center p-4">
            <TouchableOpacity
                onPress={captureWeb}
                activeOpacity={0.8}
                className="px-6 py-3 rounded border-2 border-double border-white"
            >
                <Text className="text-white">Capture</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

