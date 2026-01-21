import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CategoryLike = { id: number | null; name: string };

type Props = {
  options: CategoryLike[];
  selectedId: number | null;
  onChange: (id: number) => void;
};

export function SingleSelectChips({ options, selectedId, onChange }: Props) {
  return (
    <View className="w-full mt-2">
      <View className="flex-row flex-wrap">
        {options.map((c) => {
          const isSelected = selectedId === c.id;

          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => {
                if (c.id !== null) onChange(c.id);
              }}
              className={`flex-row items-center px-3 py-2 rounded-full mr-2 mb-2 ${
                isSelected ? "bg-[#579468]" : "bg-[#E8998D]/20"
              }`}
            >
              <Text className="text-white">{c.name}</Text>
              <Text className={`ml-2 font-bold ${isSelected ? "text-white" : "text-white/70"}`}>
                {isSelected ? "✓" : "+"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
