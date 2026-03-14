import BackButton from "@/components/backButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { FASTAPI_URL } from "@/IP_Config";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserSubcategory = {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  item_count: number;
};

export default function SettingsScreen() {
  const { scale, updateScale } = useFontScale();
  const { logout, user } = useAuth();
  const Typography = createTypography(scale);

  const [subcategories, setSubcategories] = useState<UserSubcategory[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  const Option = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => (
    <TouchableOpacity
      onPress={() => updateScale(value)}
      className="w-full border border-[#E6E6E6] bg-white py-4 px-5 mb-3"
      style={{ borderRadius: 4 }}
    >
      <Text
        style={[
          Typography.body,
          {
            letterSpacing: 0.3,
            color: "#000",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const fetchAllUserSubcategories = async () => {
    try {
      setLoadingSubs(true);

      const res = await fetch(
        `${FASTAPI_URL}/subcategories/all?user_id=${user.id}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.log("Load subcategories failed:", data);
        setSubcategories([]);
        return;
      }

      setSubcategories(data.subcategories ?? []);
    } catch (e) {
      console.log("Load subcategories request failed:", e);
      setSubcategories([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  const deleteSubcategory = async (subcategoryId: number) => {
    try {
      const res = await fetch(
        `${FASTAPI_URL}/subcategories/${subcategoryId}?user_id=${user.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          "Cannot delete subcategory",
          data.detail || "Move the items in this subcategory first."
        );
        return;
      }

      await fetchAllUserSubcategories();
    } catch (e) {
      console.log("Delete subcategory request failed:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllUserSubcategories();
    }, [user.id])
  );

  const groupedSubcategories = useMemo(() => {
    const groups: Record<string, UserSubcategory[]> = {};

    for (const sub of subcategories) {
      if (!groups[sub.category_name]) {
        groups[sub.category_name] = [];
      }
      groups[sub.category_name].push(sub);
    }

    return groups;
  }, [subcategories]);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row justify-between mt-12 px-3">
        <BackButton />

        <Pressable className="mx-3" onPress={logout}>
          <MaterialIcons name="logout" size={24} color="black" />
        </Pressable>
      </View>

      {/* TITLE */}
      <View className="px-4 pt-2 pb-2">
        <Text
          style={[
            Typography.body,
            {
              fontSize: Typography.body.fontSize * 0.85,
              letterSpacing: 2,
              color: "#444",
            },
          ]}
        >
          APP
        </Text>

        <Text
          style={[
            Typography.header,
            {
              fontSize: Typography.header.fontSize * 0.92,
              letterSpacing: 0.3,
              color: "#000",
            },
          ]}
        >
          Settings
        </Text>
      </View>

      <View className="h-[1px] bg-[#E6E6E6]" />

      <ScrollView className="flex-1 px-4 mt-6" showsVerticalScrollIndicator={false}>
        {/* TEXT SIZE */}
        <Text
          style={[
            Typography.body,
            {
              fontSize: Typography.body.fontSize * 0.85,
              letterSpacing: 1.5,
              color: "#6E6E6E",
              marginBottom: 12,
            },
          ]}
        >
          TEXT SIZE
        </Text>

        <Option label="Small" value={3} />
        <Option label="Medium" value={4} />
        <Option label="Large" value={5} />

        {/* WARDROBE SETTINGS */}
        <Text
          style={[
            Typography.body,
            {
              fontSize: Typography.body.fontSize * 0.85,
              letterSpacing: 1.5,
              color: "#6E6E6E",
              marginTop: 20,
              marginBottom: 12,
            },
          ]}
        >
          WARDROBE
        </Text>

        <TouchableOpacity
          onPress={() => setSubModalOpen(true)}
          className="w-full border border-[#E6E6E6] bg-white py-4 px-5 mb-3 flex-row items-center justify-between"
          style={{ borderRadius: 4 }}
        >
          <View className="flex-1 pr-3">
            <Text style={[Typography.body, { color: "#000" }]}>
              Manage subcategories
            </Text>
            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.82,
                  color: "#6E6E6E",
                  marginTop: 4,
                },
              ]}
            >
              Delete custom subcategories you no longer need
            </Text>
          </View>

          <MaterialIcons name="chevron-right" size={22} color="black" />
        </TouchableOpacity>
      </ScrollView>

      {/* SUBCATEGORY MODAL */}
      <Modal visible={subModalOpen} animationType="slide">
        <View className="flex-1 bg-white pt-12">
          <View className="flex-row justify-between items-center px-4 pb-3">
            <Text style={[Typography.section, { color: "#000" }]}>
              Manage Subcategories
            </Text>

            <Pressable onPress={() => setSubModalOpen(false)}>
              <Text style={[Typography.body, { color: "#000" }]}>Close</Text>
            </Pressable>
          </View>

          <View className="h-[1px] bg-[#E6E6E6]" />

          <ScrollView className="flex-1 px-4 pt-4">
            {loadingSubs ? (
              <View className="py-6 items-center">
                <ActivityIndicator />
              </View>
            ) : subcategories.length === 0 ? (
              <Text style={[Typography.body, { color: "#6E6E6E" }]}>
                No custom subcategories yet.
              </Text>
            ) : (
              Object.entries(groupedSubcategories).map(([categoryName, subs]) => (
                <View key={categoryName} className="mb-6">
                  <Text
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize * 0.85,
                        letterSpacing: 1.5,
                        color: "#6E6E6E",
                        marginBottom: 10,
                      },
                    ]}
                  >
                    {categoryName.toUpperCase()}
                  </Text>

                  {subs.map((sub) => (
                    <View
                      key={sub.id}
                      className="border border-[#E6E6E6] bg-white px-4 py-4 mb-3 flex-row items-center justify-between"
                      style={{ borderRadius: 4 }}
                    >
                      <View className="flex-1 pr-3">
                        <Text style={[Typography.body, { color: "#000" }]}>
                          {sub.name}
                        </Text>

                        <Text
                          style={[
                            Typography.body,
                            {
                              fontSize: Typography.body.fontSize * 0.82,
                              color: "#6E6E6E",
                              marginTop: 4,
                            },
                          ]}
                        >
                          {sub.item_count} item{sub.item_count === 1 ? "" : "s"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (sub.item_count > 0) {
                            Alert.alert(
                              "Cannot delete",
                              `This subcategory contains ${sub.item_count} item(s). Move them before deleting.`
                            );
                            return;
                          }

                          Alert.alert(
                            "Delete subcategory",
                            `Delete "${sub.name}"?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => deleteSubcategory(sub.id),
                              },
                            ]
                          );
                        }}
                        className="border border-black px-3 py-2"
                        style={{ borderRadius: 4 }}
                      >
                        <Text
                          style={[
                            Typography.body,
                            {
                              fontSize: Typography.body.fontSize * 0.8,
                              letterSpacing: 1,
                              color: "#000",
                            },
                          ]}
                        >
                          DELETE
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}