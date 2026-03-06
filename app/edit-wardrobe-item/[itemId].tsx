import EditableItemCard from "@/components/editableItemCard";
import EditItemLayout from "@/components/layout";
import { FASTAPI_URL } from "@/IP_Config";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function EditWardrobeItemScreen() {
  const { itemId } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    const loadItem = async () => {
      try {
        const res = await fetch(`${FASTAPI_URL}/items/${itemId}`);
        const data = await res.json();
        console.log("Loaded item:", data);
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
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0c0f0d" />
        <Text className="mt-3 text-black tracking-[2xl] text-lg">Loading item...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="mt-3 text-black tracking-[2xl] text-lg">Item not found.</Text>
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
          occasions: item.occasions ?? [],
          seasons: item.seasons ?? [],
          in_laundry: item.in_laundry ?? undefined,
          last_worn: item.last_worn ?? null,
        }}
      />
    </EditItemLayout>
  );
}
