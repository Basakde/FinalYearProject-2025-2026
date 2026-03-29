import { getUnwornItems } from "@/components/api/itemApi";
import BackButton from "@/components/backButton";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import { WardrobeItem } from "@/types/items";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLS = 4;
const GAP = 6;
const H_PAD = 8;

export default function UnwornItemsView() {
  const { scale } = useFontScale();
  const Typography = createTypography(scale);
  const { width } = useWindowDimensions();

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const tileW = (width - H_PAD * 2 - GAP * (COLS - 1)) / COLS;
  const tileH = tileW * (3 / 2);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setErrorText(null);
      const data = await getUnwornItems(14);
      setItems(data || []);
    } catch (error) {
      console.log("Error fetching unworn items:", error);
      setItems([]);
      setErrorText("Could not load unworn items.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const getLastWornLabel = (item: WardrobeItem) => {
    if (!item.last_worn_at) {
      return "Never worn";
    }

    return `Last worn ${new Date(item.last_worn_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-1">
        <BackButton fallbackHref="/(tabs)/wardrobe" />
        <ScreenHelpButton
          title="Unworn Items"
          subtitle="Review pieces you have never worn or have not worn in the last 14 days."
          items={[
            "This screen shows items returned by the unworn-items endpoint.",
            "Tap an item card to open it in the edit screen.",
            "Use this view to revisit neglected pieces before adding more clothes.",
          ]}
        />
      </View>

      <View className="px-4 mt-3 pb-2">
        <Text
          style={[
            Typography.body,
            {
              fontSize: Typography.body.fontSize * 0.95,
              letterSpacing: 2.5,
              color: "#444",
            },
          ]}
        >
          REVISIT
        </Text>
        <Text
          style={[
            Typography.header,
            {
              fontSize: Typography.header.fontSize * 1.2,
              letterSpacing: 0.3,
              color: "#000",
            },
          ]}
        >
          Unworn Items
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A1683A" />
          <Text style={[Typography.body, { color: "#6C9A8B", marginTop: 12 }]}>Loading items...</Text>
        </View>
      ) : errorText ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text
            style={[
              Typography.body,
              {
                color: "#111",
                textAlign: "center",
              },
            ]}
          >
            {errorText}
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-2 pt-2">
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={COLS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 90 }}
            columnWrapperStyle={{ gap: GAP }}
            ListEmptyComponent={
              <View className="items-center justify-center pt-20 px-8">
                <Text
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.85,
                      letterSpacing: 2,
                      color: "#111",
                      opacity: 0.6,
                    },
                  ]}
                >
                  NO UNWORN ITEMS
                </Text>
                <Text
                  style={[
                    Typography.body,
                    {
                      color: "#6E6E6E",
                      marginTop: 8,
                      textAlign: "center",
                    },
                  ]}
                >
                  Everything in your wardrobe has been worn recently.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/edit-wardrobe-item/[itemId]",
                    params: { itemId: item.id },
                  })
                }
                style={{ width: tileW, marginBottom: 8 }}
                className="overflow-hidden"
              >
                <View className="rounded-[4px] overflow-hidden bg-[#F7F7F7]">
                  <View style={{ height: tileH }} className="w-full">
                    <Image
                      source={{ uri: item.processed_img_url || item.image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                </View>

                <Text
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.82,
                      color: "#000",
                      marginTop: 4,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.img_description || "Untitled item"}
                </Text>

                <Text
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.68,
                      color: "#6E6E6E",
                      marginTop: 2,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {getLastWornLabel(item)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View className="px-4 pb-2">
        <Text
          style={[
            Typography.body,
            {
              fontSize: Typography.body.fontSize * 0.72,
              letterSpacing: 1.5,
              color: "#6E6E6E",
              marginTop: 4,
            },
          ]}
        >
          Total unworn items: {items.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}