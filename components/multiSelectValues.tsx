import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MultiSelectValuesProps {
  values: string[];
  onChange: (values: string[]) => void;
  list?: string[];
}

//const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

export function MultiSelectValues({ values, onChange, list}: MultiSelectValuesProps) {
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View className="w-full mt-2 mb-2">
      <View className="flex-row flex-wrap">
        {(list ?? []).map((value) => {
          const selected = values.includes(value);

          return (
            <TouchableOpacity
              key={value}
              onPress={() => toggleValue(value)}
              className="pr-2 mb-3"
              style={{ width: "25%" }}
            >
              <View
                className={`flex-row items-center justify-between border px-3 py-3 ${
                  selected ? "bg-green-100 border-black" : "bg-white border-[#E6E6E6]"
                }`}
                style={{ borderRadius: 4 }}
              >
                <Text
                  className="tracking-[0.5px] text-black"
                  style={{ fontSize: Typography.body.fontSize * 0.90 }}
                  numberOfLines={1}
                >
                  {value}
                </Text>
                <Text
                  className={`font-bold ${selected ? "text-black" : "text-black/70"}`}
                  style={{ fontSize: Typography.body.fontSize * 0.90 }}
                >
                  {selected ? "✓" : "+"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}