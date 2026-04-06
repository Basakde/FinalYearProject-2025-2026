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
              className={`mr-2 mb-2 px-4 py-2 border ${
                isSelected
                  ? "bg-green-100 border-black"
                  : "bg-white border-[#E6E6E6]"
              }`}
              style={{ borderRadius: 4 }}
            >
              <Text
                className={`text-[12px] tracking-[0.5px] ${
                  isSelected ? "text-black" : "text-black"
                }`}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
