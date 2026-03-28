import React, { useEffect, useMemo, useRef } from "react";
import { FlatList, Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function OutfitSlider({
  items,
  index,
  onChange,
  pinned,
  onTogglePin,
  orientation = "horizontal",
}: any) {
  const listRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();

  // “Card” width inside padding
  const cardW = useMemo(() => width - 32, [width]); // if your parent uses px-4 (16+16)

  // keep FlatList synced when parent changes index (shuffle)
  useEffect(() => {
    if (!items?.length) return;
    const safeIndex = Math.max(0, Math.min(index, items.length - 1));
    listRef.current?.scrollToIndex({ index: safeIndex, animated: true });
  }, [index, items?.length]);

  const onMomentumEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / cardW);
    if (newIndex !== index) onChange(newIndex);
  };

  const renderDots = () => {
    if (!items?.length) return null;
    return (
      <View className="flex-row justify-center mt-2">
        {items.map((_: any, i: number) => (
          <View
            key={i}
            className={`${i === index ? "bg-black" : "bg-[#DADADA]"} mx-1`}
            style={{ width: 6, height: 6, borderRadius: 3 }}
          />
        ))}
      </View>
    );
  };

  if (!items?.length) return null;

  return (
    <View className="mt-4">
      {/* Header row: category title goes in parent OR keep here */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[12px] tracking-[2px] text-black">ITEM</Text>

        {/* Pin (lock) — small, clean */}
        <TouchableOpacity
          onPress={onTogglePin}
          className="border border-[#E6E6E6] px-3 py-2 bg-white"
          style={{ borderRadius: 4 }}
        >
          <Ionicons name={pinned ? "lock-closed" : "lock-open"} size={16} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Swipeable cards */}
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(it: any) => it.id}
        horizontal
        pagingEnabled
        snapToInterval={cardW}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: cardW, offset: cardW * i, index: i })}
        renderItem={({ item }: any) => (
          <View style={{ width: cardW }}>
            {/* Zara-style: portrait + minimal border */}
            <View className="border border-[#E6E6E6] bg-[#F7F7F7] overflow-hidden" style={{ borderRadius: 4 }}>
              <View style={{ aspectRatio: 2 / 3 }}>
                <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
              </View>
            </View>

            {/* Optional: tiny caption */}
            <Text className="text-[11px] text-[#6E6E6E] mt-2" numberOfLines={1}>
              {item.img_description || ""}
            </Text>
          </View>
        )}
      />

      {renderDots()}
    </View>
  );
}
