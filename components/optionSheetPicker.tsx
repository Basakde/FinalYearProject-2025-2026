import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Option = {
  id: string;
  name: string;
};

function norm(s: string) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export default function OptionSheetPicker({
  label,
  selected,
  onChange,
  options = [],  
  columns = 2,
  emptyText = "No selection",
  chooseText = "CHOOSE",
  manageText,
  onManagePress,
}: {
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options?: { id: string; name: string }[]; 
  columns?: 1 | 2 | 3;
  emptyText?: string;
  chooseText?: string;
  manageText?: string;
  onManagePress?: () => void;
}) {
  const safeOptions = Array.isArray(options) ? options : [];

  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected.map(norm)), [selected]);
  //setMaterialOptions(Array.isArray(data.options) ? data.options : []);


  const toggle = (name: string) => {
    const key = norm(name);
    if (selectedSet.has(key)) onChange(selected.filter((s) => norm(s) !== key));
    else onChange([...selected, name]);
  };

  const itemWidth = columns === 1 ? "100%" : columns === 2 ? "50%" : "33.333%";

  return (
    <View className="mt-6">
      {/* Label */}
      <Text className="text-[11px] tracking-[1.8px] text-[#6E6E6E]">
        {label.toUpperCase()}
      </Text>

      {/* Selected preview */}
      <View className="flex-row flex-wrap mt-2">
        {selected.length === 0 ? (
          <Text className="text-[12px] text-[#6E6E6E]">{emptyText}</Text>
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

      {/* Open */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="mt-2 border border-[#E6E6E6] bg-white px-4 py-3 flex-row items-center justify-between"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-[12px] tracking-[1px] text-black">{chooseText}</Text>
        <Text className="text-black text-[16px]">▾</Text>
      </TouchableOpacity>

      {/* Bottom sheet */}
      <Modal visible={open} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)} />

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

          {/* Options */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className="flex-row flex-wrap">
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
                        isSelected ? "bg-black border-black" : "bg-white border-[#E6E6E6]"
                      }`}
                      style={{ borderRadius: 4 }}
                    >
                      <Text
                        className={`text-[12px] tracking-[0.5px] ${
                          isSelected ? "text-white" : "text-black"
                        }`}
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
              <Text className="text-[12px] text-[#6E6E6E] py-6">No options yet.</Text>
            )}
          </ScrollView>

          {/* Manage */}
          {onManagePress && (
            <TouchableOpacity
              onPress={() => {
                setOpen(false);
                onManagePress();
              }}
              className="border border-black bg-white px-4 py-3 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-[12px] tracking-[1.5px] text-black">
                {(manageText ?? `MANAGE ${label}`).toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}
