import { getUserItems } from "@/components/api/itemApi";
import { createLoggedOutfit } from "@/components/api/loggedOutfitApi";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { categories, WardrobeItem } from "@/types/items";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getWeather } from "../components/api/weatherApi";
import DailyTarotWidget from "../components/dailyTarot";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning,";
  if (h < 18) return "Good Afternoon,";
  return "Good Evening,";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).toUpperCase();
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function HomeView() {
  const { user } = useAuth();
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [weather, setWeather] = useState<any>(null);
  const [ootd, setOotd] = useState<any>(null);
  const [savedOotd, setSavedOotd] = useState(false);

  const [itemCount, setItemCount] = useState<number>(0);

  const username = user?.email?.split("@")[0] || "User";
  const todayKey = getTodayKey();
  const ootdStorageKey = user?.id ? `ootd_${user.id}` : null;
  const ootdLoggedStorageKey = user?.id ? `ootd_logged_${user.id}` : null;

  const buildOOTD = (items: WardrobeItem[]) => {
    const tops = items.filter((item) => Number(item.category_id) === categories.Top);
    const bottoms = items.filter((item) => Number(item.category_id) === categories.Bottom);
    const shoes = items.filter((item) => Number(item.category_id) === categories.Shoes);
    const jacket = items.filter((item) => Number(item.category_id) === categories.Outerwear);

    const pick = (arr: WardrobeItem[]) =>
      arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    return {
      jacket: pick(jacket),
      top: pick(tops),
      bottom: pick(bottoms),
      shoes: pick(shoes),
      date: todayKey,
    };
  };

  const generateOOTD = async (items?: WardrobeItem[]) => {
    if (!user?.id || !ootdStorageKey) return;

    const all = items ?? await getUserItems(user.id);

    setItemCount(all.length);
    const outfit = buildOOTD(all);

    setOotd(outfit);
    await AsyncStorage.setItem(ootdStorageKey, JSON.stringify(outfit));
  };

  const loadOOTD = async () => {
    if (!user?.id || !ootdStorageKey || !ootdLoggedStorageKey) return;

    const [saved, savedLogDate] = await Promise.all([
      AsyncStorage.getItem(ootdStorageKey),
      AsyncStorage.getItem(ootdLoggedStorageKey),
    ]);

    setSavedOotd(savedLogDate === todayKey);

    let allItems: WardrobeItem[] | null = null;

    try {
      allItems = await getUserItems(user.id);
      setItemCount(allItems.length);
    } catch (_) {}

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayKey) {
        setOotd(parsed);
      } else {
        generateOOTD(allItems ?? undefined);
      }
    } else {
      generateOOTD(allItems ?? undefined);
    }

    if (savedLogDate && savedLogDate !== todayKey) {
      await AsyncStorage.removeItem(ootdLoggedStorageKey);
    }
  };

  const logOOTD = async () => {
    if (!ootd || !user?.id || !ootdLoggedStorageKey || savedOotd) return;

    const payload = {
      outerwear_id: ootd.jacket?.id ?? null,
      top_id: ootd.top?.id ?? null,
      jumpsuit_id: null,
      bottom_id: ootd.bottom?.id ?? null,
      shoes_id: ootd.shoes?.id ?? null,
    };

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
    const wornDate = new Date().toISOString().slice(0, 10);

    await createLoggedOutfit({
        user_id: user.id,
        ...payload,
        worn_at: wornDate,
    });

    await AsyncStorage.setItem(ootdLoggedStorageKey, todayKey);
    setSavedOotd(true);
  } catch (e: any) {
    console.log(e.message);
  }
};

  useEffect(() => {
    if (!user?.id) return;

    loadOOTD();
    getWeather().then((data) => { if (data) setWeather(data); });
  }, [user?.id]);

  const OOTD_PARTS = ["jacket", "top", "bottom", "shoes"] as const;

  return (
    <ScrollView
      key={scale}
      className="flex-1 bg-white"
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View className="px-4 pt-14 pb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text
              className="text-[#9A9A9A] tracking-[3px]"
              style={{ fontSize: Typography.body.fontSize * 0.9 }}
            >
              WELCOME BACK
            </Text>

            <Text
              className="mt-0.5 text-black"
              style={{
                fontSize: Typography.header.fontSize * 1.4,
                lineHeight: Typography.header.fontSize * 1.7,
                letterSpacing: -0.5,
              }}
            >
              {getGreeting().toUpperCase()}
            </Text>

            <Text
              className="mt-0.5 text-black"
              style={{
                fontSize: Typography.header.fontSize * 1.18,
                lineHeight: Typography.header.fontSize * 1.6,
                letterSpacing: -0.5,
              }}
            >
              {username.toUpperCase()}
            </Text>
          </View>

          <View className="items-end">
            {weather && (
              <View className="mt-3 flex-row items-center rounded border border-[#E6E6E6] bg-white px-3 py-2">
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                  }}
                  className="h-[26px] w-[26px]"
                />
                <View className="ml-2">
                  <Text
                    className="text-[#9A9A9A] tracking-[1px]"
                    style={{ fontSize: Typography.body.fontSize * 0.82 }}
                  >
                    {weather.city?.toUpperCase()}
                  </Text>
                  <Text
                    className="text-black"
                    style={{
                      fontSize: Typography.body.fontSize * 0.98,
                      fontWeight: "600",
                    }}
                  >
                    {weather.main.temp.toFixed(0)}°C
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Date + item count row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text
              className="mr-2.5 text-[#9A9A9A] tracking-[1.5px]"
              style={{ fontSize: Typography.body.fontSize * 0.88 }}
            >
              {getFormattedDate()}
            </Text>

            <View className="mr-2.5 h-3 w-[1px] bg-[#E6E6E6]" />

            <Text
              className="mr-1.5 text-[#9A9A9A] tracking-[1.5px]"
              style={{ fontSize: Typography.body.fontSize * 0.88 }}
            >
              {itemCount}
            </Text>
            <Text
              className="text-[#9A9A9A] tracking-[1.5px]"
              style={{ fontSize: Typography.body.fontSize * 0.88 }}
            >
              ITEMS IN WARDROBE
            </Text>
          </View>

          <ScreenHelpButton
            title="Home Screen"
            subtitle="Your daily dashboard for outfit inspiration and quick access to wardrobe features."
            items={[
              "Check out your suggested Outfit of the Day based on your wardrobe.",
              "Easily log the suggested outfit to keep track of your style history.",
              "See a quick snapshot of today's weather to help you dress accordingly.",
              "Use the bottom navigation to explore your wardrobe, stylist, and more.",
            ]}
          />
        </View>
      </View>

      <View className="h-[1px] bg-[#E6E6E6]" />
      <DailyTarotWidget />  

     {/* OOTD */}
      {ootd && (
        <View className="mt-1 rounded border border-[#E6E6E6] bg-white p-4">
          <View className="flex-row items-end justify-between">
            <View>
              <Text
                className="text-black tracking-[2px]"
                style={{ fontSize: Typography.body.fontSize * 0.9 }}
              >
                OUTFIT
              </Text>

              <Text className="mt-1 text-black" style={{ fontSize: Typography.section.fontSize }}>
                Suggested Outfit of the Day
              </Text>
            </View>

          </View>

          {/* Outfit pieces */}
          <View className="flex-row mt-4 justify-between">
              {OOTD_PARTS.map((part) => {
                const item = ootd[part];

                return (
                  <View key={part} className="w-[24%] items-center">
                    {item ? (
                      <>
                        <View className="aspect-[0.82] w-full overflow-hidden rounded border border-[#E6E6E6] bg-[#F7F7F7]">
                          <Image
                            source={{ uri: item.image_url }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        </View>

                        <Text
                          className="mt-2 text-center text-[#6E6E6E] tracking-[1px]"
                          style={{ fontSize: Typography.body.fontSize * 0.78 }}
                        >
                          {part.toUpperCase()}
                        </Text>
                      </>
                    ) : (
                      <View className="aspect-[0.82] w-full" />
                    )}
                  </View>
                );
              })}
            </View>

          {/* Actions */}
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={logOOTD}
              disabled={savedOotd}
              className={`flex-1 items-center rounded border px-4 py-3 ${savedOotd ? "border-[#999999] opacity-50" : "border-black opacity-100"}`}
            >
              <Text
                className="text-black tracking-[1.5px]"
                style={{ fontSize: Typography.body.fontSize * 0.9 }}
              >
                {savedOotd ? "ADDED TO CALENDAR" : "SELECT AS OOTD"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        

      {/* ── BOTTOM NAV ROWS ── */}
      <View className="mx-4 mt-4 gap-2">

        {/* Wardrobe row */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/wardrobe")}
          className="flex-row items-center justify-between rounded border border-[#E6E6E6] bg-white px-4 py-4"
        >
          <View>
            <Text
              className="text-[#9A9A9A] tracking-[2px]"
              style={{ fontSize: Typography.body.fontSize * 0.88 }}
            >
              WARDROBE
            </Text>
            <Text className="mt-0.5 text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
              Browse {itemCount} items
            </Text>
          </View>
          <Text className="text-[#CACACA]" style={{ fontSize: Typography.body.fontSize * 1.25 }}>›</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}