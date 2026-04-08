import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type ScreenHelpButtonProps = {
  title: string;
  subtitle?: string;
  items: string[];
};

export default function ScreenHelpButton({ title, subtitle, items }: ScreenHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="w-9 h-9 m-2 border-2 border-[#D4A017] bg-[#FFF8E1] items-center justify-center"
        style={{ borderRadius: 999 }}
        accessibilityRole="button"
        accessibilityLabel="Open screen help"
      >
        <Ionicons name="information-circle" size={18} color="#000" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/30 justify-center px-6" onPress={() => setOpen(false)}>
          <Pressable
            onPress={() => {}}
            className="bg-white border border-[#E6E6E6] px-5 py-5"
            style={{ borderRadius: 16 }}
          >
            <Text style={[Typography.section, { color: "#000" }]}>{title}</Text>

            {subtitle ? (
              <Text style={[Typography.body, { color: "#6E6E6E", marginTop: 8 }]}>
                {subtitle}
              </Text>
            ) : null}

            <View className="mt-4">
              {items.map((item, index) => (
                <View key={`${title}-${index}`} className="flex-row items-start mb-3">
                  <View
                    className="w-6 h-6 border border-[#E6E6E6] items-center justify-center mr-3"
                    style={{ borderRadius: 999 }}
                  >
                    <Text style={[Typography.body, { fontSize: Typography.body.fontSize * 0.85, color: "#000" }]}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text
                    style={[
                      Typography.body,
                      {
                        color: "#222",
                        flex: 1,
                        lineHeight: Typography.body.fontSize * 1.45,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setOpen(false)}
              className="mt-2 border border-black bg-white py-3 items-center"
              style={{ borderRadius: 8 }}
            >
              <Text style={[Typography.body, { color: "#000", letterSpacing: 1.2 }]}>GOT IT</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}