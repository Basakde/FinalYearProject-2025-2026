import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type ColorOption = {
  id: string;
  name: string;
  hex?: string;
};

function norm(s: string) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export default function ColorPalettePicker({
  label = "COLORS",
  selected,
  onChange,
  options,
  labelClassName,
}: {
  label?: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options: ColorOption[];
  labelClassName?: string;
}) {
  const { scale } = useFontScale();
  const Typography = createTypography(scale);
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected.map(norm)), [selected]);

  const toggle = (name: string) => {
    const key = norm(name);
    if (selectedSet.has(key)) onChange(selected.filter((s) => norm(s) !== key));
    else onChange([...selected, name]);
  };

  return (
    <View className="mt-6">
      {/* Label */}
      <Text className={`tracking-[1.8px] ${labelClassName ?? "text-[#6E6E6E]"}`} style={{ fontSize: Typography.body.fontSize * 0.95 }}>
        {label.toUpperCase()}
      </Text>

      {/* Selected preview  */}
      <View className="flex-row flex-wrap mt-2">
        {selected.length === 0 ? (
          <Text className="text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>No selection</Text>
        ) : (
          selected.map((tag) => (
            <View
              key={tag}
              className="flex-row items-center border border-black bg-green-100 mr-2 mb-2 px-3 py-2"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>{tag}</Text>
              <TouchableOpacity
                onPress={() => onChange(selected.filter((t) => t !== tag))}
                className="ml-2"
              >
                <Text className="text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Open palette button */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="mt-2 border border-[#E6E6E6] bg-white px-4 py-3 flex-row items-center justify-between"
        style={{ borderRadius: 4 }}
      >
        <Text className="tracking-[1px] text-black" style={{ fontSize: Typography.body.fontSize * 0.85 }}>CHOOSE COLORS</Text>
        <Text className="text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>▾</Text>
      </TouchableOpacity>

      {/* Bottom sheet modal */}
      <Modal visible={open} transparent animationType="slide">
        {/* Tap outside */}
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)} />

        {/* Card */}
        <View
          className="bg-white px-4 pt-4 pb-6"
          style={{ height: "45%", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="tracking-[2px] text-black" style={{ fontSize: Typography.body.fontSize * 0.75 }}>{label.toUpperCase()}</Text>

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text className="tracking-[1px] text-black" style={{ fontSize: Typography.body.fontSize * 0.75 }}>DONE</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable grid */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className="flex-row flex-wrap">
              {options.map((o) => {
                const isSelected = selectedSet.has(norm(o.name));
                const hex = o.hex ?? "#CFCFCF";

                return (
                  <TouchableOpacity
                    key={o.id}
                    onPress={() => toggle(o.name)}
                    className="mb-4"
                    style={{ width: "20%" }}
                  >
                    <View className="items-center">
                      {/* Circle */}
                      <View 
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: hex,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#111111" : "#E6E6E6",
                        }}
                      />

                      {/* Name */}
                      <Text
                        className="mt-2 text-center tracking-[0.6px] text-[#6E6E6E]"
                        style={{ fontSize: Typography.body.fontSize * 0.85 }}
                        numberOfLines={2}
                      >
                        {o.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {options.length === 0 && (
              <Text className="py-6 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.75 }}>No colors yet.</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
