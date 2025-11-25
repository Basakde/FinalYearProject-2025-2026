import { WardrobeItem } from "@/types/items";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

export interface OutfitSliderProps {
  //title: string;
  items: WardrobeItem[];
  index: number;
  onChange: (newIndex: number) => void;
}

export default function OutfitSlider({
  //title,
  items,
  index,
  onChange,
}: OutfitSliderProps) {
  const current = items[index];

  return (
    <View className="my-0 items-center">
      <Text className="text-lg font-extrabold text-[#6C9A8B] mb-3">
        
      </Text>

      <View className="flex-row items-center w-full justify-center">
        {/* LEFT ARROW */}
        <TouchableOpacity
            onPress={() => {
                const newIndex = (index - 1 + items.length) % items.length;
                onChange(newIndex);
            }}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={32} color="#202020" />
        </TouchableOpacity>

        {/* IMAGE */}
        {current ? (
          <Image
            source={{ uri: current.image_url }}
            className="w-52 h-52 rounded-2xl"
          />
        ) : (
          <View className="w-40 h-40 rounded-2xl justify-center items-center">
            <Text className="text-gray-500">No item</Text>
          </View>
        )}

        {/* RIGHT ARROW */}
        <TouchableOpacity
          onPress={() => {
                        const newIndex = (index + 1) % items.length;
                        onChange(newIndex);
                    }}
          className="p-2"
        >
          <Ionicons name="chevron-forward" size={32} color="#202020" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
