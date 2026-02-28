import EditableItemCard from "@/components/editableItemCard";
import EditItemLayout from "@/components/layout";
import { FASTAPI_URL } from "@/IP_Config";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function ImageEditView() {
  const { originalUri } = useLocalSearchParams();

  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!originalUri) return;

    const runBgRemoval = async () => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: decodeURIComponent(originalUri as string),
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    const res = await fetch(`${FASTAPI_URL}/remove-bg/`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.log("remove-bg error:", await res.text());
      return;
    }

    // read ONCE
    const data = await res.json(); // { b64, mime }

    setProcessedUri(`data:${data.mime};base64,${data.b64}`);

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
        occasions: [],
        seasons: [],
        in_laundry: undefined,
      }}
    />
  </EditItemLayout>
);
}
