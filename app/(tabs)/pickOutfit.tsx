import { getUnwornItems, getUserItems } from "@/components/api/itemApi";
import { createLoggedOutfit } from "@/components/api/loggedOutfitApi";
import OutfitSlider from "@/components/outfitSlider";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";
import { categories, WardrobeItem } from "@/types/items";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

const getTodayKey = () => new Date().toISOString().slice(0, 10);

export default function PickOutfit() {
  const { user, logout } = useAuth();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  type CategoryKey = "tops" | "bottoms" | "shoes" | "jacket" | "accessory" | "jumpsuit";

  const [tops, setTops] = useState<WardrobeItem[]>([]);
  const [bottoms, setBottoms] = useState<WardrobeItem[]>([]);
  const [shoes, setShoes] = useState<WardrobeItem[]>([]);
  const [jacket, setJacket] = useState<WardrobeItem[]>([]);
  const [accessory, setAccessory] = useState<WardrobeItem[]>([]);
  const [jumpsuit, setJumpsuit] = useState<WardrobeItem[]>([]);
  const [generalViewOpen, setGeneralViewOpen] = useState(false);
  const [logDate, setLogDate] = useState<string | null>(null);
  const [donationSuggestionOpen, setDonationSuggestionOpen] = useState(false);
  const [donationSuggestionItem, setDonationSuggestionItem] = useState<WardrobeItem | null>(null);
  const [favoriteSuccessOpen, setFavoriteSuccessOpen] = useState(false);
  const donationStorageKey = `donation_suggestion_${user.id}_${getTodayKey()}`;

  const getSelectedItem = (cat: CategoryKey) => {
    const arr = getItems(cat);
    const idx = indexes[cat] ?? 0;
    if (!enabled[cat]) return null;
    if (!arr || arr.length === 0) return null;
    return arr[Math.min(idx, arr.length - 1)];
  };

  const previewOrder: CategoryKey[] = ["jacket", "tops", "jumpsuit", "bottoms", "shoes", "accessory"];

  const buildSelectedOutfitPayload = () => {
    const selectedJacket = enabled.jacket ? getSelectedItem("jacket") : null;
    const selectedTop = enabled.tops ? getSelectedItem("tops") : null;
    const selectedJumpsuit = enabled.jumpsuit ? getSelectedItem("jumpsuit") : null;
    const selectedBottom = enabled.bottoms ? getSelectedItem("bottoms") : null;
    const selectedShoes = enabled.shoes ? getSelectedItem("shoes") : null;

    return {
      outerwear_id: selectedJacket?.id ?? null,
      top_id: selectedTop?.id ?? null,
      bottom_id: selectedBottom?.id ?? null,
      jumpsuit_id: selectedJumpsuit?.id ?? null,
      shoes_id: selectedShoes?.id ?? null,
    };
  };

  const [indexes, setIndexes] = useState<Record<CategoryKey, number>>({
    jacket: 0,
    tops: 0,
    bottoms: 0,
    jumpsuit: 0,
    shoes: 0,
    accessory: 0,
  });

  const [pinned, setPinned] = useState<Record<CategoryKey, boolean>>({
    jacket: false,
    tops: false,
    bottoms: false,
    jumpsuit: false,
    shoes: false,
    accessory: false,
  });

  const [enabled, setEnabled] = useState<Record<CategoryKey, boolean>>({
    jacket: false,
    tops: true,
    bottoms: true,
    jumpsuit: false,
    shoes: true,
    accessory: false,
  });

  const toggleEnabled = (cat: CategoryKey) => {
    setEnabled((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const togglePin = (cat: CategoryKey) => {
    setPinned((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getItems = (cat: CategoryKey) => {
    if (cat === "jacket") return jacket;
    if (cat === "tops") return tops;
    if (cat === "jumpsuit") return jumpsuit;
    if (cat === "bottoms") return bottoms;
    if (cat === "shoes") return shoes;
    if (cat === "accessory") return accessory;
    return [];
  };

  const shuffle = () => {
    setIndexes((prev) => {
      const updated = { ...prev };

      (Object.keys(enabled) as CategoryKey[]).forEach((cat) => {
        if (!enabled[cat]) return;
        if (pinned[cat]) return;

        const arr = getItems(cat);
        if (!arr || arr.length === 0) return;

        updated[cat] = Math.floor(Math.random() * arr.length);
      });

      return updated;
    });
  };

  const labelFor = (cat: CategoryKey) => {
    if (cat === "jacket") return "Outerwear";
    if (cat === "tops") return "Top";
    if (cat === "jumpsuit") return "Jumpsuit";
    if (cat === "bottoms") return "Bottom";
    if (cat === "shoes") return "Shoes";
    return "Accessory";
  };

  const fetchItems = useCallback(async () => {
    const all = await getUserItems(user.id);

    setJacket(all.filter((i) => Number(i.category_id) === categories.Outerwear));
    setTops(all.filter((i) => Number(i.category_id) === categories.Top));
    setJumpsuit(all.filter((i) => Number(i.category_id) === categories.Jumpsuit));
    setBottoms(all.filter((i) => Number(i.category_id) === categories.Bottom));
    setShoes(all.filter((i) => Number(i.category_id) === categories.Shoes));
    setAccessory(all.filter((i) => Number(i.category_id) === categories.Accessory));

    setIndexes((prev) => ({
      jacket: Math.min(prev.jacket, Math.max(0, (all.filter((i) => Number(i.category_id) === categories.Outerwear).length || 1) - 1)),
      tops: Math.min(prev.tops, Math.max(0, (all.filter((i) => Number(i.category_id) === categories.Top).length || 1) - 1)),
      jumpsuit: Math.min(prev.jumpsuit, Math.max(0, (all.filter((i) => Number(i.category_id) === categories.Jumpsuit).length || 1) - 1)),
      bottoms: Math.min(prev.bottoms, Math.max(0, (all.filter((i) => Number(i.category_id) === categories.Bottom).length || 1) - 1)),
      shoes: Math.min(prev.shoes, Math.max(0, (all.filter((i) => Number(i.category_id) === categories.Shoes).length || 1) - 1)),
      accessory: Math.min(prev.accessory, Math.max(0, (all.filter((i) => Number(i.category_id) === categories.Accessory).length || 1) - 1)),
    }));
  }, [user.id]);

  const maybeShowDonationSuggestion = useCallback(async () => {
    try {
      const alreadyShown = await AsyncStorage.getItem(donationStorageKey);
      if (alreadyShown) return;

      const unwornItems = await getUnwornItems(14);
      if (!unwornItems.length) return;

      const randomItem = unwornItems[Math.floor(Math.random() * unwornItems.length)];
      setDonationSuggestionItem(randomItem);
      setDonationSuggestionOpen(true);
    } catch (error) {
      console.log("Failed to load donation suggestion:", error);
    }
  }, [donationStorageKey]);

  const closeDonationSuggestion = async () => {
    if (donationSuggestionItem?.id) {
      await AsyncStorage.setItem(donationStorageKey, donationSuggestionItem.id);
    }
    setDonationSuggestionOpen(false);
  };

  const donationImageUri = donationSuggestionItem?.processed_img_url || donationSuggestionItem?.image_url;
  const donationLastWornLabel = donationSuggestionItem?.last_worn_at
    ? new Date(donationSuggestionItem.last_worn_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Never worn";

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      maybeShowDonationSuggestion();
    }, [fetchItems, maybeShowDonationSuggestion])
  );

  useEffect(() => {
    setLogDate(typeof date === "string" && date.length > 0 ? date : null);
  }, [date]);

  const ToggleChipsRow = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
      <View className="flex-row">
        {(["jacket", "tops", "bottoms", "shoes", "accessory", "jumpsuit"] as CategoryKey[]).map((cat) => {
          const active = enabled[cat];
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => toggleEnabled(cat)}
              className={`mr-2 border px-3 py-2 ${active ? "bg-black border-black" : "bg-white border-[#E6E6E6]"}`}
              style={{ borderRadius: 4 }}
            >
              <Text
                className={active ? "tracking-[0.5px] text-white" : "tracking-[0.5px] text-black"}
                style={{ fontSize: Typography.body.fontSize * 0.85 }}
              >
                {labelFor(cat)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const EmptyHint = ({ cat }: { cat: CategoryKey }) => (
    <View className="w-full border border-[#E6E6E6] bg-white p-4 mt-3" style={{ borderRadius: 4 }}>
      <Text
        className="tracking-[1.5px] text-black"
        style={{ fontSize: Typography.body.fontSize * 0.85 }}
      >
        {labelFor(cat).toUpperCase()}
      </Text>
      <Text className="mt-2 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize }}>
        No items in this category yet.
      </Text>
    </View>
  );

  const buildOutfitItemIds = () => {
    return [
      enabled.jacket && jacket.length ? jacket[indexes.jacket].id : null,       // slot 0
      enabled.tops && tops.length ? tops[indexes.tops].id : null,               // slot 1
      enabled.bottoms && bottoms.length ? bottoms[indexes.bottoms].id : null,   // slot 2
      enabled.shoes && shoes.length ? shoes[indexes.shoes].id : null,           // slot 3
      enabled.jumpsuit && jumpsuit.length ? jumpsuit[indexes.jumpsuit].id : null, // slot 4
      enabled.accessory && accessory.length ? accessory[indexes.accessory].id : null, // slot 5
    ];
  };

  const favoriteOutfit = async () => {
    const itemIds = buildOutfitItemIds();
    const realItemCount = itemIds.filter(Boolean).length;

    if (realItemCount < 2) {
      console.log("Need at least 2 items to save an outfit");
      return;
    }

    try {
      const res = await authFetch(`${FASTAPI_URL}/favorites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outfit_id: null,
          item_ids: itemIds,
          name: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Favorite failed:", data);
        return;
      }

      console.log("Favorited outfit:", data.outfit_id);
      setGeneralViewOpen(false);
      setFavoriteSuccessOpen(true);
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const logOutfitAsOOTD = async () => {
    const payload = buildSelectedOutfitPayload();

    const itemIds = [
      payload.outerwear_id,
      payload.top_id,
      payload.jumpsuit_id,
      payload.bottom_id,
      payload.shoes_id,
    ].filter(Boolean);

    if (itemIds.length < 1) {
      console.log("Need at least 1 item to log outfit");
      return;
    }

    try {
      await createLoggedOutfit({
          user_id: user.id,
          ...payload,
          worn_at: logDate ?? null,
      });

      setGeneralViewOpen(false);
      setLogDate(null);

      setTimeout(() => {
        router.navigate("/(tabs)/calendar");
      }, 300);
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const renderSlider = (cat: CategoryKey, arr: WardrobeItem[]) => {
    if (!enabled[cat]) return null;
    if (!arr || arr.length === 0) return <EmptyHint key={cat} cat={cat} />;

    return (
      <OutfitSlider
        key={cat}
        items={arr}
        index={indexes[cat]}
        onChange={(i: any) => setIndexes((prev) => ({ ...prev, [cat]: i }))}
        pinned={pinned[cat]}
        onTogglePin={() => togglePin(cat)}
        onRemove={undefined as any}
        orientation="horizontal"
      />
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Modal
        visible={donationSuggestionOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDonationSuggestion}
      >
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white p-5" style={{ borderRadius: 16 }}>
            <Text
              className="mb-2 text-center tracking-[2px] text-[#6E6E6E]"
              style={{ fontSize: Typography.body.fontSize }}
            >
             SUGGESTION
            </Text>

            <Text
              className="mb-4 text-center text-black"
              style={{ fontSize: Typography.header.fontSize }}
            >
              You have not worn this in over 2 weeks - consider donating it or include it in an outfit to wear again!
            </Text>

            {donationImageUri ? (
              <Image
                source={{ uri: donationImageUri }}
                style={{ width: "80%", height: 280, borderRadius: 12, marginBottom: 14, alignSelf: "center" }}
                resizeMode="cover"
              />
            ) : null}

            <Text
              className="mb-1.5 text-center text-[#444444]"
              style={{ fontSize: Typography.body.fontSize }}
            >
              Last worn: {donationLastWornLabel}
            </Text>

            {donationSuggestionItem?.img_description ? (
              <Text
                className="mb-[18px] text-center text-[#6E6E6E]"
                style={{ fontSize: Typography.body.fontSize }}
              >
                {donationSuggestionItem.img_description}
              </Text>
            ) : (
              <View style={{ marginBottom: 18 }} />
            )}

            <Pressable
              onPress={closeDonationSuggestion}
              className="border border-black bg-white py-3 items-center"
              style={{ borderRadius: 6 }}
            >
              <Text
                className="tracking-[1.2px] text-black"
                style={{ fontSize: Typography.body.fontSize }}
              >
                KEEP FOR NOW
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={favoriteSuccessOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setFavoriteSuccessOpen(false);
          setTimeout(() => {
            router.push({ pathname: "/(tabs)/wardrobe", params: { tab: "favorites" } });
          }, 300);
        }}
      >
        <View className="flex-1 bg-black/30 justify-center items-center px-6">
          <View className="w-full max-w-[320px] bg-white border border-[#E6E6E6] px-6 py-7 items-center" style={{ borderRadius: 16 }}>
            <Text
              className="mb-3 text-center text-black"
              style={{ fontSize: Typography.header.fontSize }}
            >
              Added To Favorites
            </Text>

            <Text
              className="mb-5 text-center leading-[22px] text-[#444444]"
              style={{ fontSize: Typography.body.fontSize }}
            >
              This outfit was added to your favorites.
            </Text>

            <Pressable
              onPress={() => {
                setFavoriteSuccessOpen(false);
                setTimeout(() => {
                  router.push({ pathname: "/(tabs)/wardrobe", params: { tab: "favorites" } });
                }, 300);
              }}
              className="border border-black bg-white py-2.5 px-6"
              style={{ borderRadius: 6 }}
            >
              <Text
                className="tracking-[1.2px] text-black"
                style={{ fontSize: Typography.body.fontSize }}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View className="flex-row justify-between mt-12 px-3">
        <View className="w-10 h-10 ml-3" />
        <View className="flex-row items-center">
          <ScreenHelpButton
            title="Pick Outfit"
            subtitle="Build a look by browsing pieces from each category."
            items={[
              "Swipe each row to review available tops, bottoms, shoes, outerwear, and more.",
              "Pin pieces you want to keep while changing the rest of the outfit.",
              "Use the General View to save a favorite or log the outfit as OOTD.",
              "To add new categories' items select categories toggle chips under General View.",
              logDate ? `You are currently logging for ${logDate}.` : "Open this screen from the calendar when you want to log for a specific day.",
            ]}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="flex-row justify-between items-end">
          <View>
            <Text
              className="tracking-[2px] text-black"
              style={{ fontSize: Typography.body.fontSize * 0.95 }}
            >
              PICK
            </Text>
            <Text
              className="tracking-[0.5px] text-black"
              style={{ fontSize: Typography.header.fontSize * 1.2 }}
            >
              YOUR OUTFIT
            </Text>
          </View>

          {logDate ? (
            <View className="flex-row items-center">
              <Text className="text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
                Logging for {logDate}
              </Text>
              <TouchableOpacity onPress={() => setLogDate(null)} className="ml-2">
                <Text className="text-black" style={{ fontSize: Typography.body.fontSize * 1.75 }}>×</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => setGeneralViewOpen(true)}
          className="mt-3 border border-black bg-white px-4 py-3 flex-row items-center justify-center"
          style={{ borderRadius: 4 }}
        >
          <Text
            className="tracking-[1.5px] text-black"
            style={{ fontSize: Typography.body.fontSize * 0.95 }}
          >
            GENERAL VIEW
          </Text>
        </TouchableOpacity>

        <ToggleChipsRow />

        <View className="mt-6">
          {(previewOrder as CategoryKey[]).map((cat) => {
            const arr = getItems(cat);
            return (
              <View key={cat} className="mb-4">
                <Text
                  className="mb-2 tracking-[2px] text-black"
                  style={{ fontSize: Typography.body.fontSize * 0.95 }}
                >
                  {labelFor(cat).toUpperCase()}
                </Text>
                {renderSlider(cat, arr)}
              </View>
            );
          })}
        </View>

        <Modal visible={generalViewOpen} transparent animationType="slide">
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => setGeneralViewOpen(false)}
          />

          <View className="absolute inset-0 justify-center items-center px-6" pointerEvents="box-none">
            <View
              className="w-full bg-white p-4"
              style={{ borderRadius: 8, height: "85%" }}
              pointerEvents="auto"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="tracking-[2px] text-black"
                  style={{ fontSize: Typography.body.fontSize * 0.85 }}
                >
                  GENERAL VIEW
                </Text>

                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={shuffle}
                    className="border border-[#E6E6E6] px-3 py-2 mr-2"
                    style={{ borderRadius: 4 }}
                  >
                    <Ionicons name="shuffle" size={18} color="#111111" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setGeneralViewOpen(false)}>
                    <Text
                      className="tracking-[1px] text-black"
                      style={{ fontSize: Typography.body.fontSize * 0.85 }}
                    >
                      CLOSE
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
              >
                <View className="items-center">
                  {(previewOrder as CategoryKey[]).map((cat) => {
                    const it = getSelectedItem(cat);
                    if (!it) return null;

                    return (
                      <View key={cat} className="mb-4 items-center">
                        <Text
                          className="mb-3 text-[#6E6E6E]"
                          style={{ fontSize: Typography.body.fontSize * 0.8 }}
                        >
                          {labelFor(cat)}
                        </Text>

                        <View style={{ width: 170, position: "relative" }}>
                          <View
                            className="border border-[#E6E6E6] bg-[#F7F7F7] overflow-hidden"
                            style={{ borderRadius: 4 }}
                          >
                            <View style={{ aspectRatio: 2 / 3 }}>
                              <Image
                                source={{ uri: it.image_url }}
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={() => togglePin(cat)}
                            activeOpacity={0.7}
                            className={`absolute top-3 right-3 w-10 h-10 rounded-full items-center justify-center ${
                              pinned[cat] ? "bg-black" : "bg-white"
                            } border border-[#E6E6E6]`}
                          >
                            <Ionicons
                              name={pinned[cat] ? "lock-closed" : "lock-open-outline"}
                              size={26}
                              color={pinned[cat] ? "white" : "black"}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {previewOrder.every((cat) => !getSelectedItem(cat)) && (
                    <Text className="mt-6 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize }}>
                      Nothing selected yet.
                    </Text>
                  )}
                </View>
              </ScrollView>

              <View className="mt-3 flex-row">
                <TouchableOpacity
                  onPress={favoriteOutfit}
                  className="flex-1 border border-black bg-white px-4 py-3 items-center justify-center mr-2"
                  style={{ borderRadius: 4 }}
                >
                  <Text
                    className="tracking-[1.5px] text-black"
                    style={{ fontSize: Typography.body.fontSize * 0.72 }}
                  >
                    ADD TO FAVORITE
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={logOutfitAsOOTD}
                  className="flex-1 border border-black bg-black px-4 py-3 items-center justify-center"
                  style={{ borderRadius: 4 }}
                >
                  <Text
                    className="tracking-[1.5px] text-white"
                    style={{ fontSize: Typography.body.fontSize * 0.72 }}
                  >
                    {logDate ? "LOG OUTFIT" : "WEAR TODAY"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}