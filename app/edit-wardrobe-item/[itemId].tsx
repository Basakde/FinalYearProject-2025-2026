import EditableItemCard from "@/components/editableItemCard";
import EditItemLayout from "@/components/layout";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function EditWardrobeItemScreen() {
  const { itemId } = useLocalSearchParams();
  const FASTAPI_URL = "http://192.168.0.12:8000";

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    const loadItem = async () => {
      try {
        const res = await fetch(`${FASTAPI_URL}/items/${itemId}`);
        const data = await res.json();
        setItem(data.item);
      } catch (err) {
        console.log("Failed to load item:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#723d46]">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-3 text-white">Loading item...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 justify-center items-center bg-[#723d46]">
        <Text className="text-white text-lg">Item not found.</Text>
      </View>
    );
  }

  return (
    <EditItemLayout>
      <EditableItemCard
        item={{
          id: item.id,
          imageUri: item.image_url,
          processedUri: item.processed_img_url || item.image_url,
          imgDescription: item.img_description,
          categoryId: item.category_id,
          subcategoryId: item.subcategory_id,
          colors: item.colors ?? [],
          materials: item.materials ?? [],
          occasion: item.occasions ?? [],
          season: item.seasons ?? [],
        }}
      />
    </EditItemLayout>
  );
}
