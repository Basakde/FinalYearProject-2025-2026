import ImageEditCard from "@/components/editable-item-card";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ImageEditView() {
  const params = useLocalSearchParams();

  const processedUri = Array.isArray(params.processedUri)
    ? params.processedUri[0]
    : params.processedUri;

  if (!processedUri) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">No processed image available.</Text>
      </View>
    );
  }

  const decodedProcessedUri = decodeURIComponent(processedUri);

  return (
    <View className="flex-1 bg-zinc-900">
      <ImageEditCard
        item={{
          imageUri: decodedProcessedUri,
          processedUri: decodedProcessedUri, // ✅ ensure it's there
        }}
        onUpdate={(updated) => console.log("Updated:", updated)}
        className="w-full"
      />
    </View>
  );
}
