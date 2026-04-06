import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";


function norm(s: string) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export default function OptionSheetPicker({
  label,
  selected,
  onChange,
  options = [],  
  columns = 3,
  emptyText = "No selection",
  chooseText = "CHOOSE",
  manageText,
  onManagePress,
}: {
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options?: { id: string; name: string }[]; 
  columns?: number;
  emptyText?: string;
  chooseText?: string;
  manageText?: string;
  onManagePress?: () => void;
}) {
  const safeOptions = Array.isArray(options) ? options : [];
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected.map(norm)), [selected]);


  const toggle = (name: string) => {
    const key = norm(name);
    if (selectedSet.has(key)) onChange(selected.filter((s) => norm(s) !== key));
    else onChange([...selected, name]);
  };

  const itemWidth = columns === 3 ? "33.333%" : "100%";

  return (
    <View className="mt-6">
      {/* Label */}
      <Text className="tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
        {label.toUpperCase()}
      </Text>

      {/* Selected preview */}
      <View className="flex-row flex-wrap mt-2">
        {selected.length === 0 ? (
          <Text className="text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>{emptyText}</Text>
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

      {/* Open */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="mt-2 border border-[#E6E6E6] bg-white px-4 py-3 flex-row items-center justify-between"
        style={{ borderRadius: 4 }}
      >
        <Text className="tracking-[1px] text-black" style={{ fontSize: Typography.body.fontSize * 0.85 }}>{chooseText}</Text>
        <Text className="text-black" style={{ fontSize: Typography.body.fontSize }}>▾</Text>
      </TouchableOpacity>

      {/* Bottom sheet */}
      <Modal visible={open} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)} />

        <View
          className="bg-white px-4 pt-4 pb-6"
          style={{ height: "40%", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="tracking-[2px] text-black" style={{ fontSize: Typography.header.fontSize * 0.75 }}>{label.toUpperCase()}</Text>

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text className="tracking-[1px] text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>DONE</Text>
            </TouchableOpacity>
          </View>

          {/* Options */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className="flex-row flex-wrap mt-5 mb-5">
              {safeOptions.map((o) => {
                const isSelected = selectedSet.has(norm(o.name));

                return (
                  <TouchableOpacity
                    key={o.id}
                    onPress={() => toggle(o.name)}
                    style={{ width: itemWidth }}
                    className="pr-2 mb-3"
                  >
                    <View
                      className={`border px-3 py-3 ${
                        isSelected ? "bg-green-100 border-black" : "bg-white border-[#E6E6E6]"
                      }`}
                      style={{ borderRadius: 4 }}
                    >
                      <Text
                        className={`tracking-[0.5px] ${
                          isSelected ? "text-black" : "text-black"
                        }`}
                        style={{ fontSize: Typography.body.fontSize * 0.90 }}
                        numberOfLines={1}
                      >
                        {o.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {safeOptions.length === 0 && (
              <Text className="py-6 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>No options yet.</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
