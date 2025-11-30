import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View, Modal } from "react-native";

export default function CustomDropdown({
  label,
  items,
  value,
  onSelect,
}: {
  label: string;
  items: { id: number; name: string }[];
  value: number | null;
  onSelect: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = items.find(i => i.id === value)?.name || "Select...";

  return (
    <View className="w-full">
      <Text className="text-[#d5f2e3] text-lg font-bold mt-6">{label}</Text>

      {/* BUTTON */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="border rounded-lg bg-white px-3 py-3 mt-1"
      >
        <Text>{selectedLabel}</Text>
      </TouchableOpacity>

      {/* DROPDOWN */}
      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-center px-20"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-xl p-4 max-h-80 shadow-lg">
            <FlatList
              data={items}
              nestedScrollEnabled
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  className="px-3 py-3 border-b"
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
