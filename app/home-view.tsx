import DailyTarotWidget from "@/components/dailyTarot";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { FASTAPI_URL } from "@/IP_Config";
import { categories } from "@/types/items";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getWeather } from "../components/api/weatherApi";
import { authFetch } from "@/supabase/supabaseConfig";

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
  const [ootd, setOotd] = useState<any>(null);
  const [savedOotd, setSavedOotd] = useState(false);

  const [itemCount, setItemCount] = useState<number>(0);

  const username = user?.email?.split("@")[0] || "User";

  const generateOOTD = async () => {
    const res = await authFetch(`${FASTAPI_URL}/items/user/${user.id}`);
    const data = await res.json();
    const all = data.items || [];

    setItemCount(all.length);

    const tops = all.filter((i: any) => i.category_id === categories.Top);
    const bottoms = all.filter((i: any) => i.category_id === categories.Bottom);
    const shoes = all.filter((i: any) => i.category_id === categories.Shoes);
    const jacket = all.filter((i: any) => i.category_id === categories.Outerwear);

    const pick = (arr: any[]) =>
      arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    const outfit = {
      jacket: pick(jacket),
      top: pick(tops),
      bottom: pick(bottoms),
      shoes: pick(shoes),
      date: new Date().toDateString(),
    };

    setOotd(outfit);
    await AsyncStorage.setItem(`ootd_${user.id}`, JSON.stringify(outfit));
    setSavedOotd(false);
  };

  const loadOOTD = async () => {
    const saved = await AsyncStorage.getItem(`ootd_${user.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toDateString()) {
        setOotd(parsed);
      } else {
        generateOOTD();
      }
    } else {
      generateOOTD();
    }

    try {
      const res = await authFetch(`${FASTAPI_URL}/items/user/${user.id}`);
      const data = await res.json();
      setItemCount((data.items || []).length);
    } catch (_) {}
  };

  const logOOTD = async () => {
  if (!ootd || !user?.id || savedOotd) return;

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

    const res = await authFetch(`${FASTAPI_URL}/logged_outfits/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        outfit_id: null,
        ...payload,
        name: null,
        worn_at: wornDate,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("OOTD failed:", data);
      return;
    }

    console.log("Logged as OOTD:", data);
    setSavedOotd(true);
  } catch (e: any) {
    console.log(e.message);
  }
};

  useEffect(() => {
    loadOOTD();
    getWeather().then((data) => { if (data) setWeather(data); });
  }, [user.id]);

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
                  fontSize: Typography.header.fontSize * 1.6,
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

          {/* Weather pill */}
          {weather && (
            <View
              className="border border-[#E6E6E6] bg-white flex-row items-center px-3 py-2"
              style={{ borderRadius: 4, marginTop: 4 }}
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

        {/* Date + item count row */}
        <View className="flex-row items-center mt-4" style={{ gap: 10 }}>
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
                Outfit of the Day
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
                  },
                ]}
              >
                ADD TO OOTD
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