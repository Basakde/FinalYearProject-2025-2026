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

  /*const handlePress = (imageUri: string) => {
  router.push({
    pathname: "/image-edit-view" as any,
    params: { image: encodeURIComponent(imageUri) },
  });
};*/



  const handlePress = (imageUri: string) => {
  if (isSelecting) {
    console.log(isSelecting);
    setSelectedForDelete((prev) => {
      const updated = prev.includes(imageUri)
        ? prev.filter((uri) => uri !== imageUri)
        : [...prev, imageUri];

      if (updated.length === 0) {
        setIsSelecting(false);
      }

      return updated;
    });
  } else {
    router.push({
      pathname: '/image-edit-view' as any,
      params: { imageUri: encodeURIComponent(imageUri) },
    });
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
    <View className="flex-1 bg-white p-3 mt-10">
      <Text>Image Gallery</Text>
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

      {isSelecting &&  selectedForDelete.length>0 && (
        <View className="flex p-10 mt-5">
          <DeleteButton onPress={handleDeleteSelected} className="mt-10" />
        </View>
      )}

      
    </View>
  );
}
