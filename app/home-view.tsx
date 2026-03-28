import { createLoggedOutfit } from "@/components/api/loggedOutfitApi";
import { getUserItems} from "@/components/api/itemApi";
import DailyTarotWidget from "@/components/dailyTarot";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { categories, WardrobeItem } from "@/types/items";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getWeather } from "../components/api/weatherApi";

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
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View className="px-4 pt-14 pb-4">
        <View className="flex-row justify-between items-start">
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.78,
                  letterSpacing: 3,
                  color: "#9A9A9A",
                },
              ]}
            >
              WELCOME BACK
            </Text>

            <Text
              style={[
                Typography.header,
                {
                  fontSize: Typography.header.fontSize * 1.4,
                  lineHeight: Typography.header.fontSize * 1.7,
                  letterSpacing: -0.5,
                  color: "#000",
                  marginTop: 2,
                },
              ]}
            >
              {getGreeting()}
            </Text>

            <Text  style={[
                Typography.header,
                {
                  fontSize: Typography.header.fontSize * 1.1,
                  lineHeight: Typography.header.fontSize * 1.7,
                  letterSpacing: -0.5,
                  color: "#000",
                  marginTop: 2,
                },
            ]}>
                {username}
            </Text>
            
          </View>

          <View className="items-end">

            {weather && (
              <View
                className="border border-[#E6E6E6] bg-white flex-row items-center px-3 py-2"
                style={{ borderRadius: 4, marginTop: 12 }}
              >
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                  }}
                  style={{ width: 26, height: 26 }}
                />
                <View className="ml-2">
                  <Text
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize * 0.75,
                        letterSpacing: 1,
                        color: "#9A9A9A",
                      },
                    ]}
                  >
                    {weather.city?.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize * 0.9,
                        fontWeight: "600",
                        color: "#000",
                      },
                    ]}
                  >
                    {weather.main.temp.toFixed(0)}°C
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Date + item count row */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.75,
                  letterSpacing: 1.5,
                  color: "#9A9A9A",
                },
              ]}
            >
              {getFormattedDate()}
            </Text>

            <View className="w-[1px] h-3 bg-[#E6E6E6]" />

            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.75,
                  letterSpacing: 1.5,
                  color: "#9A9A9A",
                },
              ]}
            >
              {itemCount}
            </Text>
            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.75,
                  letterSpacing: 1.5,
                  color: "#9A9A9A",
                },
              ]}
            >
              ITEMS IN WARDROBE
            </Text>
          </View>

          <ScreenHelpButton
            title="Home Screen"
            subtitle="Your daily dashboard for outfit inspiration and quick access to wardrobe features."
            items={[
              "Check out your suggested Outfit of the Day based on the weather and your wardrobe.",
              "Easily log the outfit you wore to keep track of your style history.",
              "See a quick snapshot of today's weather to help you dress accordingly.",
              "Use the bottom navigation to explore your wardrobe, plan outfits, and more.",
            ]}
          />
        </View>
      </View>

      <View className="h-[1px] bg-[#E6E6E6]" />
      <DailyTarotWidget />  

     {/* OOTD */}
      {ootd && (
        <View
          className="mt-5 border border-[#E6E6E6] bg-white p-4"
          style={{ borderRadius: 4 }}
        >
          <View className="flex-row items-end justify-between">
            <View>
              <Text
                style={[
                  Typography.body,
                  {
                    fontSize: Typography.body.fontSize * 0.85,
                    letterSpacing: 2,
                    color: "#000",
                  },
                ]}
              >
                OUTFIT
              </Text>

              <Text
                style={[
                  Typography.section,
                  {
                    marginTop: 4,
                  },
                ]}
              >
                Suggested Outfit of the Day
              </Text>
            </View>

          </View>

          {/* Outfit pieces */}
          <View className="flex-row mt-4 justify-between">
              {OOTD_PARTS.map((part) => {
                const item = ootd[part];

                return (
                  <View
                    key={part}
                    className="items-center"
                    style={{ width: "24%" }}
                  >
                    {item ? (
                      <>
                        <View
                          className="border border-[#E6E6E6] bg-[#F7F7F7] overflow-hidden"
                          style={{
                            borderRadius: 4,
                            width: "100%",
                            aspectRatio: 0.82,
                          }}
                        >
                          <Image
                            source={{ uri: item.image_url }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        </View>

                        <Text
                          style={[
                            Typography.body,
                            {
                              fontSize: Typography.body.fontSize * 0.72,
                              letterSpacing: 1,
                              color: "#6E6E6E",
                              marginTop: 8,
                              textAlign: "center",
                            },
                          ]}
                        >
                          {part.toUpperCase()}
                        </Text>
                      </>
                    ) : (
                      <View
                        style={{
                          width: "100%",
                          aspectRatio: 0.82,
                        }}
                      />
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
              className="flex-1 border border-black px-4 py-3 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text
                style={[
                  Typography.body,
                  {
                    fontSize: Typography.body.fontSize * 0.85,
                    letterSpacing: 1.5,
                    color: "#000",
                     borderColor: savedOotd ? "#999" : "#000",
                     opacity: savedOotd ? 0.5 : 1,
                  },
                ]}
              >
                {savedOotd ? "ADDED TO CALENDAR" : "SELECT AS OOTD"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        

      {/* ── BOTTOM NAV ROWS ── */}
      <View className="mx-4 mt-4" style={{ gap: 8 }}>

        {/* Wardrobe row */}
        <TouchableOpacity
          onPress={() => router.push("/wardrobe")}
          className="border border-[#E6E6E6] bg-white px-4 py-4 flex-row items-center justify-between"
          style={{ borderRadius: 4 }}
        >
          <View>
            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.72,
                  letterSpacing: 2,
                  color: "#9A9A9A",
                },
              ]}
            >
              WARDROBE
            </Text>
            <Text style={[Typography.body, { color: "#000", marginTop: 2 }]}>
              Browse {itemCount} items
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: "#CACACA" }}>›</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}