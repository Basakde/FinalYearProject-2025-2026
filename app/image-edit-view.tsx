import ImageEditCard from "@/components/editable-item-card";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function ImageEditView() {
  const { originalUri } = useLocalSearchParams();
  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const FASTAPI_URL = "http://192.168.0.12:8000";

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

        const res = await fetch(`${FASTAPI_URL}/remove-bg`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to remove background");

        const data = await res.json();
        const resultUri = `data:image/png;base64,${data.processed_base64}`;
        setProcessedUri(resultUri);
      } catch (err) {
        console.error("Error removing background:", err);
      } finally {
        setIsLoading(false);
      }
    };

    runBgRemoval();
  }, [originalUri]);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={{ color: "white", marginTop: 10 }}>
            Removing background...
          </Text>
        </>
      ) : processedUri ? (
        <>
          <ImageEditCard
          item={{
            imageUri: processedUri,
            processedUri: processedUri,
          }}
          onUpdate={(updated) => console.log("Updated:", updated)}
          className="w-full"
        />
      </>
      ) : (
        <Text style={{ color: "white" }}>Failed to process image</Text>
      )}
    </View>
  );
}
