import BackButton from '@/components/backButton';
import DeleteButton from '@/components/deleteButton';
import FloatingButton from '@/components/floatingButton';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useImages } from '../context/ImageContext';

export default function MiniGalleryScreen() {
  const { selectedImages, removeImage } = useImages();
  const router = useRouter();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const handlePress = (imageUri: string) => {
    if (isSelecting) {
      if (selectedForDelete.includes(imageUri)) {
        const updated = selectedForDelete.filter(uri => uri !== imageUri);
        setSelectedForDelete(updated);
        if (updated.length === 0) setIsSelecting(false);
      } else {
        setSelectedForDelete(prev => [...prev, imageUri]);
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
            selectedForDelete.forEach(uri => removeImage(uri));
            setSelectedForDelete([]);
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#723d46] pt-14">

      {/* BACK BUTTON */}
      <BackButton />

      {/* HEADER */}
      <Text className="text-center text-2xl font-extrabold text-white mb-4">
        Image Gallery
      </Text>

      {/* DELETE MODE LABEL */}
      {isSelecting && (
        <Text className="text-center text-lg text-rose-300 mb-2">
          Tap images to select for deletion
        </Text>
      )}

      {/* IMAGE GRID */}
      <FlatList
          data={selectedImages}
          numColumns={3}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 16,
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 12,
          }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedForDelete.includes(item);

            return (
              <TouchableOpacity onPress={() => handlePress(item)} onLongPress={() => handleLongPress(item)}>
                <Image
                  source={{ uri: item }}
                  className={`w-28 h-28 rounded-xl ${
                    isSelected ? "opacity-60 border-4 border-black" : ""
                  }`}
                />
              </TouchableOpacity>
            );
          }}
        />


      {/* FLOATING ADD BUTTON */}
      <FloatingButton />

      {/* DELETE BUTTON (only visible when selecting) */}
      {isSelecting && selectedForDelete.length > 0 && (
        <View className="absolute bottom-6 left-0 right-0 items-center">
          <DeleteButton onPress={handleDeleteSelected} />
        </View>
      )}

    </View>
  );
}
