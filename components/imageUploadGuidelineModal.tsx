import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
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
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 bg-black/40 justify-center px-6">

        <View className="bg-white p-6 rounded-[6px]">

          {/* Title */}
          <Text className="tracking-[2px] text-black mb-4" style={{ fontSize: Typography.body.fontSize * 1.1 }}>
            IMAGE GUIDELINES
          </Text>

          {/* Description */}
          <Text className="text-[#6E6E6E] leading-5 mb-5" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
            To ensure accurate outfit recommendations, please upload clothing
            items following these guidelines.
          </Text>

          {/* Guidelines */}
          <View className="space-y-2 mb-5">
            <Text className="tracking-[0.5px]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
              • Item photographed alone
            </Text>

            <Text className="tracking-[0.5px]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
              • Plain or white background
            </Text>

            <Text className="tracking-[0.5px]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
              • No face or body visible
            </Text>

            <Text className="tracking-[0.5px]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
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

            <Text className="tracking-[0.5px]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              I understand these image guidelines
            </Text>
          </Pressable>

          {/* Buttons */}
          <View className="flex-row justify-end">

            <Pressable
              onPress={onClose}
              className="px-4 py-2 mr-2"
            >
              <Text className="tracking-[1px]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
                CANCEL
      </Text>
            </Pressable>

            <Pressable
              disabled={!checked}
              onPress={onAccept}
              className={`px-4 py-2 rounded ${
                checked ? "bg-black" : "bg-gray-300"
              }`}
            >
              <Text className="text-white tracking-[1px]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
                CONTINUE
      </Text>
            </Pressable>

          </View>

        </View>

      </View>
    </Modal>
);
}