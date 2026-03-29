import BackButton from "@/components/backButton";
import ScreenHelpButton from "@/components/screenHelpButton";
import DeleteButton from "@/components/deleteButton";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useImages } from "../context/ImageContext";

const NUM_COLUMNS = 4;
const HORIZONTAL_PADDING = 12;
const GAP = 6;

export default function MiniGalleryScreen() {
  const { selectedImages, removeImage } = useImages();
  const router = useRouter();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const tileWidth = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    const totalHorizontalPadding = HORIZONTAL_PADDING * 2;
    const totalGapWidth = GAP * (NUM_COLUMNS - 1);
    return (screenWidth - totalHorizontalPadding - totalGapWidth) / NUM_COLUMNS;
  }, []);

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
          onPress: async () => {
            for (const uri of selectedForDelete) {
              await removeImage(uri);
            }
            setSelectedForDelete([]);
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="pt-10 px-4">
        <View className="flex-row justify-between items-center">
          <BackButton fallbackHref="/(tabs)/wardrobe" />
          <ScreenHelpButton
            title="Image Gallery"
            subtitle="This is your staging area for captured or uploaded clothing images."
            items={[
              "Review the images you captured from camera, web, or gallery upload.",
              "Long press an image to start selection mode.",
              "Tap images to select or unselect them when deleting.",
              "Keep the images you want to use for the next wardrobe steps.",
            ]}
          />
        </View>

        <View className="mt-3">
          <Text className="text-[11px] tracking-[2.5px] text-[#444]">GALLERY</Text>
          <Text className="text-[24px] tracking-[0.3px] text-black">Images</Text>
        </View>

        {isSelecting && (
          <View
            className="mt-3 border border-[#E8E8E8] bg-white px-3 py-2"
            style={{ borderRadius: 3 }}
          >
            <Text className="text-[12px] text-[#222]">
              Tap images to select or unselect.
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 px-3 pt-3">
        <FlatList
          data={selectedImages}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          columnWrapperStyle={{ gap: GAP }}
          keyExtractor={(uri) => uri}
          ListEmptyComponent={
            <View className="items-center justify-center pt-20">
              <Text className="text-[12px] tracking-[2px] text-[#777]">NO IMAGES YET</Text>
              <Text className="mt-2 text-[13px] text-[#555]">
                Captured or selected images will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selectedForDelete.includes(item);

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  width: tileWidth,
                  marginBottom: 8,
                }}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item)}
              >
                <View
                  className="overflow-hidden border bg-[#F7F7F7]"
                  style={{
                    borderRadius: 3,
                    borderColor: isSelected ? "#000" : "#E6E6E6",
                  }}
                >
                  <View style={{ aspectRatio: 2 / 3 }}>
                    <Image
                      source={{ uri: item }}
                      className="h-full w-full"
                      resizeMode="cover"
                      onError={() => removeImage(item)}
                      style={{
                        opacity: isSelected ? 0.58 : 1,
                      }}
                    />
                  </View>

                  {isSelected && (
                    <View className="absolute top-1.5 right-1.5 bg-black px-1.5 py-[2px]">
                      <Text className="text-[9px] tracking-[1px] text-white">SELECTED</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isSelecting && selectedForDelete.length > 0 && (
        <View className="absolute bottom-6 left-0 right-0 items-center">
          <DeleteButton
              onPress={handleDeleteSelected}
              variant="filled"
              shape="circle"
              size="md"
            />
        </View>
      )}
    </View>
  );
}