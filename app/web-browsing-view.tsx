import BackButton from "@/components/backButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import { WebView } from "react-native-webview";
import { useImages } from "../context/ImageContext";

export default function WebBrowserScreen() {
  const { url } = useLocalSearchParams();
  const { addImages } = useImages();
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);

  const captureWeb = async () => {
    try {

      //check if viewShotRef exists and has capture method 
      if (!viewShotRef.current?.capture) return;
      //if yes, capture the screenshot
      const uri = await viewShotRef.current.capture();
      if (!uri) return;
      // save image into app gallery state
      addImages(uri);

      //notify user
      Alert.alert("Captured!", "Image added to your gallery.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">

      <View className="w-full bg-black px-4 py-3 flex-row items-center border-b border-[#222]">
        <BackButton />
      </View>

      <View style={{ flex: 1 }}>
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }} style={{ flex: 1 }}>
          <WebView source={{ uri: url as string }} style={{ flex: 1, backgroundColor: "black" }} />
        </ViewShot>
      </View>

      <View className="flex-row justify-between items-center px-8 py-3 bg-black border-t border-[#222]">

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-[#E8998D] font-semibold text-lg">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={captureWeb} className="bg-[#6C9A8B] px-8 py-3 rounded-xl shadow-md">
          <Text className="text-white font-semibold text-lg">Capture 📸</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/image-gallery-view")}>
          <Text className="text-[#E8998D] font-semibold text-lg">Done</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}
