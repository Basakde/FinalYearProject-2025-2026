import BackButton from "@/components/backButton";
import DeleteButton from "@/components/deleteButton";
import FloatingButton from "@/components/floatingButton";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useImages } from "../context/ImageContext";

export default function MiniGalleryScreen() {
  const { selectedImages, removeImage } = useImages();
  const router = useRouter();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const handlePress = (imageUri: string) => {
    if (isSelecting) {
      if (selectedForDelete.includes(imageUri)) {
        const updated = selectedForDelete.filter((uri) => uri !== imageUri);
        setSelectedForDelete(updated);
        if (updated.length === 0) setIsSelecting(false);
      } else {
        setSelectedForDelete((prev) => [...prev, imageUri]);
      }
      return;
    }

    router.push({
      pathname: "/image-edit-view",
      params: { originalUri: encodeURIComponent(imageUri) },
    });
  };

  const handleLongPress = (imageUri: string) => {
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedForDelete([imageUri]);
    }
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      "Delete selected images?",
      `Delete ${selectedForDelete.length} image(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            selectedForDelete.forEach((uri) => removeImage(uri));
            setSelectedForDelete([]);
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* top spacing */}
      <View className="pt-10 px-4">
        <BackButton />

        {/* Header */}
        <View className="mt-3">
          <Text className="text-[12px] tracking-[2px] text-black">GALLERY</Text>
          <Text className="text-[22px] tracking-[0.5px] text-black">Images</Text>
        </View>

        {/* Delete mode hint */}
        {isSelecting && (
          <View className="mt-3 border border-[#E6E6E6] bg-white px-3 py-2" style={{ borderRadius: 4 }}>
            <Text className="text-[12px] text-black">
              Tap to select. Press Delete to remove.
            </Text>
          </View>
        )}
      </View>

      {/* Grid */}
      <View className="flex-1 px-3 pt-3">
        <FlatList
          data={selectedImages}
          numColumns={4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          columnWrapperStyle={{ gap: 6 }}
          keyExtractor={(uri) => uri} // ✅ IMPORTANT FIX (see below)
          renderItem={({ item }) => {
            const isSelected = selectedForDelete.includes(item);

            return (
              <TouchableOpacity
                style={{ flex: 1, marginBottom: 8 }}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item)}
              >
                <View
                  className={`border bg-[#F7F7F7] overflow-hidden ${isSelected ? "border-black" : "border-[#E6E6E6]"}`}
                  style={{ borderRadius: 4 }}
                >
                  <View style={{ aspectRatio: 2 / 3 }}>
                    <Image
                      source={{ uri: item }}
                      className={`w-full h-full ${isSelected ? "opacity-60" : ""}`}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FloatingButton />

      {/* Delete button */}
      {isSelecting && selectedForDelete.length > 0 && (
        <View className="absolute bottom-6 left-0 right-0 items-center">
          <DeleteButton onPress={handleDeleteSelected} />
        </View>
      )}
    </View>
  );
}
