import DeleteButton from '@/components/delete-button';
import FloatingButton from '@/components/floating-button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useImages } from '../context/ImageContext';

export default function MiniGalleryScreen() {
  const { selectedImages, removeImage } = useImages();
  const router = useRouter();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const FASTAPI_URL = "http://192.168.0.12:8000";

  const handlePress = async (imageUri: string) => {
    if (isSelecting) return;

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);


      // STEP 2 — Send same image for BG removal (no DB)
      const removeRes = await fetch(`${FASTAPI_URL}/remove-bg`, {
        method: "POST",
        body: formData,
      });
      const removeData = await removeRes.json();

      const processedUri = `data:image/png;base64,${removeData.processed_base64}`;

      // STEP 3 — Navigate to edit screen showing only processed image
      router.push({
        pathname: "/image-edit-view",
        params: {
          processedUri: encodeURIComponent(processedUri),
        },
      });
    } catch (err) {
      console.error("Error uploading or processing image:", err);
    }
  };

  const handleLongPress = (imageUri: string) => {
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedForDelete([imageUri]);
    }
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete selected?',
      `Do you want to delete ${selectedForDelete.length} selected image(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
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
    <View className="flex-1 bg-zinc-900p-3 mt-10">
      <Text className="text-lg font-bold mb-2">Image Gallery</Text>
      <FlatList
        data={selectedImages}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedForDelete.includes(item);
          return (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
            >
              <Image
                source={{ uri: item }}
                style={{
                  width: 100,
                  height: 100,
                  margin: 4,
                  borderRadius: 8,
                  opacity: isSelected ? 0.5 : 1,
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: isSelected ? 'black' : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        }}
      />

      <FloatingButton />

      {isSelecting && selectedForDelete.length > 0 && (
        <View className="flex p-10 mt-5">
          <DeleteButton onPress={handleDeleteSelected} className="mt-10" />
        </View>
      )}
    </View>
  );
}
