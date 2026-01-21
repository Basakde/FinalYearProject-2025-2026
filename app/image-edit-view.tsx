import EditableItemCard from "@/components/editableItemCard";
import EditItemLayout from "@/components/layout";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function ImageEditView() {
  const { originalUri } = useLocalSearchParams();
  const FASTAPI_URL = "http://192.168.0.12:8000";

  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!originalUri) return;

    const runBgRemoval = async () => {
      try {
        const formData = new FormData();
        //prepare the file to send to backend
        formData.append("file", {
          uri: decodeURIComponent(originalUri as string),
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);

        //send the file to backend for background removal
        const res = await fetch(`${FASTAPI_URL}/remove-bg/`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        setProcessedUri(`data:image/png;base64,${data.processed_base64}`);
      } catch (e) {
        console.log("BG removal failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    runBgRemoval();
  }, [originalUri]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#723d46]">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Removing background...</Text>
      </View>
    );
  }

  if (!processedUri) {
    return (
      <View className="flex-1 justify-center items-center bg-[#723d46]">
        <Text className="text-white text-lg">Failed to process image.</Text>
      </View>
    );
  }

  return (
  <EditItemLayout>
    <EditableItemCard
      item={{
        id: null,
        imageUri: processedUri,
        processedUri: processedUri,
        imgDescription: "",
        categoryId: null,
        subcategoryId: null,
        colors: [],
        materials: [],
        occasion: [],
        season: [],
      }}
    />
  </EditItemLayout>
);
}
