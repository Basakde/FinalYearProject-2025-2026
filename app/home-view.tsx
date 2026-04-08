import { getMostWornItems, getUnwornItems, getUserItems } from "@/components/api/itemApi";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { WardrobeItem } from "@/types/items";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function HomeView() {
  const { user } = useAuth();
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [weather, setWeather] = useState<any>(null);
  const [unwornItems, setUnwornItems] = useState<WardrobeItem[]>([]);
  const [mostWornItems, setMostWornItems] = useState<WardrobeItem[]>([]);

  const [itemCount, setItemCount] = useState<number>(0);

  const username = user?.email?.split("@")[0] || "User";

  useEffect(() => {
    if (!user?.id) return;

    getUserItems(user.id).then((all) => setItemCount(all.length)).catch(() => {});
    getMostWornItems(8).then((data) => {
      console.log("Most worn response:", JSON.stringify(data));
      setMostWornItems(data || []);
    }).catch((err) => {
      console.log("Most worn error:", err);
      setMostWornItems([]);
    });
    getWeather().then((data) => { if (data) setWeather(data); });
    getUnwornItems(14).then((data) => setUnwornItems(data || [])).catch(() => setUnwornItems([]));
  }, [user?.id]);

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
                fontSize: Typography.header.fontSize * 1.2,
                lineHeight: Typography.header.fontSize * 1.3,
                letterSpacing: -0.5,
              }}
            >
              {getGreeting().toUpperCase()}
            </Text>

            <Text
              className="mt-0.5 text-black"
              style={{
                fontSize: Typography.header.fontSize * 1.18,
                lineHeight: Typography.header.fontSize * 1.5,
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
              "Daily card readings to inspire your outfit choices.",
              "Check out your unworn items.",
              "See a quick snapshot of today's weather to help you dress accordingly.",
              "Use the bottom navigation to explore your wardrobe, stylist, and more.",
            ]}
          />
        </View>
      </View>

      <View className="h-[1px] bg-[#E6E6E6]" />
      <DailyTarotWidget />  

     {/* DONATION SUGGESTIONS — UNWORN ITEMS */}
      <TouchableOpacity
        onPress={() => router.push("/unworn-items-view")}
        className="mx-4 mt-4 rounded border border-[#E6E6E6] bg-white p-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-11 h-11 rounded-full bg-[#F0EDE6] items-center justify-center mr-3">
              <MaterialCommunityIcons name="hanger" size={22} color="#6E6E6E" />
            </View>
            <View className="flex-1">
              <Text
                className="text-black tracking-[2px]"
                style={{ fontSize: Typography.body.fontSize * 0.9 }}
              >
                DONATION SUGGESTIONS
              </Text>
              <Text
                className="mt-1 text-[#6E6E6E]"
                style={{ fontSize: Typography.body.fontSize * 0.85 }}
              >
                {unwornItems.length > 0
                  ? `${unwornItems.length} item${unwornItems.length !== 1 ? "s" : ""} unworn for 2+ weeks`
                  : "All items worn recently"}
              </Text>
            </View>
          </View>

          <MaterialCommunityIcons name="recycle" size={20} color="#9A9A9A" />
        </View>

        {unwornItems.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {unwornItems.slice(0, 6).map((item) => (
              <View
                key={item.id}
                className="mr-2 overflow-hidden rounded border border-[#E6E6E6] bg-[#F7F7F7]"
                style={{ width: 56, height: 74 }}
              >
                <Image
                  source={{ uri: item.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ))}

            {unwornItems.length > 6 && (
              <View
                className="items-center justify-center rounded border border-[#E6E6E6] bg-[#F7F7F7]"
                style={{ width: 56, height: 74 }}
              >
                <Text
                  className="text-[#6E6E6E]"
                  style={{ fontSize: Typography.body.fontSize * 0.8 }}
                >
                  +{unwornItems.length - 6}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </TouchableOpacity>

      {/* ── MOST WORN ITEMS ── */}
      {mostWornItems.length > 0 && (
        <View className="mx-4 mt-4 rounded border border-[#E6E6E6] bg-white p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-full bg-[#F0EDE6] items-center justify-center mr-3">
                <MaterialCommunityIcons name="fire" size={22} color="#6E6E6E" />
              </View>
              <View>
                <Text
                  className="text-black tracking-[2px]"
                  style={{ fontSize: Typography.body.fontSize * 0.9 }}
                >
                  MOST WORN
                </Text>
                <Text
                  className="mt-0.5 text-[#6E6E6E]"
                  style={{ fontSize: Typography.body.fontSize * 0.85 }}
                >
                  Your go-to pieces
                </Text>
              </View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mostWornItems.map((item) => (
              <View key={item.id} className="mr-2 items-center">
                <View
                  className="overflow-hidden rounded border border-[#E6E6E6] bg-[#F7F7F7]"
                  style={{ width: 56, height: 74 }}
                >
                  <Image
                    source={{ uri: item.processed_img_url || item.image_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <Text
                  className="mt-1 text-[#9A9A9A]"
                  style={{ fontSize: Typography.body.fontSize * 0.65 }}
                  numberOfLines={1}
                >
                  {item.last_worn_at
                    ? new Date(item.last_worn_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    : ""}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── BOTTOM NAV ROWS ── */}
      <View className="mx-4 mt-4 gap-2">

        {/* Wardrobe row */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/wardrobe")}
          className="flex-row items-center justify-between rounded border border-[#E6E6E6] bg-white px-4 py-4"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-[#F0EDE6] items-center justify-center mr-3">
              <MaterialCommunityIcons name="wardrobe-outline" size={20} color="#6E6E6E" />
            </View>
            <View>
              <Text
                className="text-black tracking-[2px]"
                style={{ fontSize: Typography.body.fontSize * 0.88 }}
              >
                WARDROBE
              </Text>
              <Text className="mt-0.5 text-[#9A9A9A]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
                Browse {itemCount} items
              </Text>
            </View>
          </View>
          <Text className="text-[#CACACA]" style={{ fontSize: Typography.body.fontSize * 1.25 }}>›</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}