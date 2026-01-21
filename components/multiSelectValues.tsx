import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MultiSelectValuesProps {
  values: string[];
  onChange: (values: string[]) => void;
  list?: string[];
}

//const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

export function MultiSelectValues({ values, onChange, list}: MultiSelectValuesProps) {
  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View className="w-full mt-2">
      <View className="flex-row flex-wrap">
        {(list ?? []).map((value) => {
          const selected = values.includes(value);

          return (
            <TouchableOpacity
              key={value}
              onPress={() => toggleValue(value)}
              className={`flex-row items-center px-3 py-2 rounded-full mr-2 mb-2 ${
                selected ? "bg-[#579468]" : "bg-[#E8998D]/20"
              }`}
            >
              <Text className={selected ? "text-white" : "text-white"}>
                {value}
              </Text>

              <Text className={`ml-2 font-bold ${selected ? "text-white" : "text-white/70"}`}>
                {selected ? "✓" : "+"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Debug line so to KNOW it updated */}
      <Text className="mt-2 text-white/70">
        Selected: {values.length ? values.join(", ") : "None"}
      </Text>
    </View>
  );
}