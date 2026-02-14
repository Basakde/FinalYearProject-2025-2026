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
}: {
  label?: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options: ColorOption[];
}) {
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
      <Text className="text-[11px] tracking-[1.8px] text-[#6E6E6E]">
        {label.toUpperCase()}
      </Text>

      {/* Selected preview  */}
      <View className="flex-row flex-wrap mt-2">
        {selected.length === 0 ? (
          <Text className="text-[12px] text-[#6E6E6E]">No selection</Text>
        ) : (
          selected.map((tag) => (
            <View
              key={tag}
              className="flex-row items-center border border-[#E6E6E6] bg-white mr-2 mb-2 px-3 py-2"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-[12px] text-black">{tag}</Text>
              <TouchableOpacity
                onPress={() => onChange(selected.filter((t) => t !== tag))}
                className="ml-2"
              >
                <Text className="text-[14px] text-black">×</Text>
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
        <Text className="text-[12px] tracking-[1px] text-black">CHOOSE</Text>
        <Text className="text-black text-[16px]">▾</Text>
      </TouchableOpacity>

      {/* Bottom sheet modal */}
      <Modal visible={open} transparent animationType="slide">
        {/* Tap outside */}
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)} />

        {/* Card */}
        <View
          className="bg-white px-4 pt-4 pb-6"
          style={{ height: "75%", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[12px] tracking-[2px] text-black">{label.toUpperCase()}</Text>

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text className="text-[12px] tracking-[1px] text-black">DONE</Text>
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
                    style={{ width: "25%" }}
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
                        className="text-[10px] tracking-[0.6px] text-[#6E6E6E] mt-2 text-center"
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
              <Text className="text-[12px] text-[#6E6E6E] py-6">No colors yet.</Text>
            )}
          </ScrollView>

          {/* Bottom action */}
          <TouchableOpacity
            onPress={() => setOpen(false)}
            className="border border-black bg-white px-4 py-3 items-center"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-[12px] tracking-[1.5px] text-black">MANAGE COLORS</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
