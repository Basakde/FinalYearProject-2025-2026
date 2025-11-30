import { WardrobeItem } from "@/types/items";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";


export interface OutfitSliderProps {
  items: WardrobeItem[];
  index: number;
  onChange: (newIndex: number) => void;
  pinned?: boolean;
  onTogglePin?: () => void;
  onRemove?: () => void;
  orientation?: "horizontal" | "vertical";
}

export default function OutfitSlider({
  pinned,
  items,
  index,
  onChange,
  onTogglePin,
  onRemove,
  orientation = "horizontal",
}: OutfitSliderProps) {
  const current = items[index];
  const isVertical = orientation === "vertical";

  return (
    <View className="items-center mb-2">

      {/* HORIZONTAL LAYOUT  */}
      {!isVertical && (
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

            {/* IMAGE + REMOVE (Image cached to prevent each time calling) */}
            <View className="relative mx-2">
              {current ? (
                <Image
                  source={{ uri: current.image_url }}
                  style={{ width: 150, height: 150 }}
                  contentFit="cover"
                  cachePolicy="memory-disk" 
                />
              ) : (
                <View className="w-40 h-40 rounded-2xl justify-center items-center">
                  <Text className="text-gray-500">No item</Text>
                </View>
              )}

              {onRemove && (
                <TouchableOpacity
                  onPress={onRemove}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-0.5"
                >
                  <Ionicons name="close-circle" size={24} color="#cc4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* RIGHT ARROW */}
            <TouchableOpacity
              onPress={() => {
                const newIndex = (index + 1) % items.length;
                onChange(newIndex);
              }}
              className="p-0"
            >
              <Ionicons name="chevron-forward" size={32} color="#202020" />
            </TouchableOpacity>

          </View>
        )}

      {/* VERTICAL LAYOUT */}
      {isVertical && (
        <View className="items-center justify-center">

          <TouchableOpacity
            onPress={() => {
              const newIndex = (index - 1 + items.length) % items.length;
              onChange(newIndex);
            }}
            className="p-1"
          >
            <Ionicons name="chevron-up" size={32} color="#202020" />
          </TouchableOpacity>

          <View className="relative my-2">
            {current ? (
              <Image
                source={{ uri: current.image_url }}
                style={{ width: 150, height: 150, borderRadius: 16 }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View className="w-40 h-40 rounded-2xl justify-center items-center">
                <Text className="text-gray-500">No item</Text>
              </View>
            )}

            {onRemove && (
              <TouchableOpacity
                onPress={onRemove}
                className="absolute -top-2 -right-2 bg-white rounded-full p-0.5"
              >
                <Ionicons name="close-circle" size={24} color="#cc4444" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              const newIndex = (index + 1) % items.length;
              onChange(newIndex);
            }}
            className="p-1"
          >
            <Ionicons name="chevron-down" size={32} color="#202020" />
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
}
