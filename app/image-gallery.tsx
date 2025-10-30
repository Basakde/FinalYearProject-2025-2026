import FloatingButton from '@/components/floating-button';
import { useRouter } from 'expo-router';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import { useImages } from '../context/ImageContext';

export default function MiniGalleryScreen() {
  const { selectedImages } = useImages();
  const router = useRouter();

  return (
    <View className="flex-1 bg-white p-3 mt-10">
      <FlatList
        data={selectedImages}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity >
            <Image
              source={{ uri: item }}
              style={{ width: 100, height: 100, margin: 4, borderRadius: 8 }}
            />
          </TouchableOpacity>

        )}
      />
      <FloatingButton />
    </View>
  );
}
