import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
};

export default function UploadGuidelinesModal({
  visible,
  onAccept,
  onClose,
}: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/40 justify-center px-6">

        <View className="bg-white p-6 rounded-[6px]">

          {/* Title */}
          <Text className="text-[14px] tracking-[2px] text-black mb-4">
            IMAGE GUIDELINES
          </Text>

          {/* Description */}
          <Text className="text-[12px] text-[#6E6E6E] leading-5 mb-5">
            To ensure accurate outfit recommendations, please upload clothing
            items following these guidelines.
          </Text>

          {/* Guidelines */}
          <View className="space-y-2 mb-5">
            <Text className="text-[12px] tracking-[0.5px]">
              • Item photographed alone
            </Text>

            <Text className="text-[12px] tracking-[0.5px]">
              • Plain or white background
            </Text>

            <Text className="text-[12px] tracking-[0.5px]">
              • No face or body visible
            </Text>

            <Text className="text-[12px] tracking-[0.5px]">
              • Clear lighting, minimal shadows
            </Text>
          </View>

          {/* Checkbox */}
          <Pressable
            onPress={() => setChecked(!checked)}
            className="flex-row items-center mb-6"
          >
            <View
              className={`w-4 h-4 border mr-3 ${
                checked ? "bg-black border-black" : "border-black"
              }`}
            />

            <Text className="text-[11px] tracking-[0.5px]">
              I understand these image guidelines
            </Text>
          </Pressable>

          {/* Buttons */}
          <View className="flex-row justify-end">

            <Pressable
              onPress={onClose}
              className="px-4 py-2 mr-2"
            >
              <Text className="text-[11px] tracking-[1px]">
                CANCEL
              </Text>
            </Pressable>

            <Pressable
              disabled={!checked}
              onPress={onAccept}
              className={`px-4 py-2 ${
                checked ? "bg-black" : "bg-gray-300"
              }`}
              style={{ borderRadius: 2 }}
            >
              <Text className="text-white text-[11px] tracking-[1px]">
                CONTINUE
              </Text>
            </Pressable>

          </View>

        </View>

      </View>
    </Modal>
  );
}