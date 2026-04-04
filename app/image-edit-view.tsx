import EditableItemCard from "@/components/editableItemCard";
import EditItemLayout from "@/components/layout";
import { FASTAPI_URL } from "@/IP_Config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useImages } from "@/context/ImageContext";
import { router, useLocalSearchParams } from "expo-router";

export default function ImageEditView() {
  const { originalUri } = useLocalSearchParams();

  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { removeImage } = useImages();
  const originalImageUri = originalUri ? decodeURIComponent(originalUri as string) : null;
  

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
    const data = await res.json(); 

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
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#244e8d" />
        <Text className="text-black tracking-[1.5px] mt-4">Removing background...</Text>
      </View>
    );
  }

  if (!processedUri) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-black tracking-[1.5px]">Failed to process image.</Text>
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
        last_worn_at: null,
        created_at: "",
      }}
      onSaved={async () => {
        if (originalImageUri) {
          await removeImage(originalImageUri);
        }
        router.push("/(tabs)/wardrobe");
      }}
    />
  </EditItemLayout>
);
}
