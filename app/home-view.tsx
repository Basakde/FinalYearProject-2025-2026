import { useAuth } from "@/context/AuthContext";
import { categories } from "@/types/items";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function HomeView() {
  const FASTAPI_URL = "http://192.168.0.12:8000";
  const { user } = useAuth();

  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState("");
  const [ootd, setOotd] = useState<any>(null);

// DAILY OUTFIT GENERATOR

  const generateOOTD = async () => {
    const res = await fetch(`${FASTAPI_URL}/items/user/${user.id}`);
    const data = await res.json();
    const all = data.items || [];

    const tops = all.filter((i: any) => i.category_id === categories.Top);
    const bottoms = all.filter((i: any) => i.category_id === categories.Bottom);
    const shoes = all.filter((i: any) => i.category_id === categories.Shoes);
    const jacket = all.filter((i: any) => i.category_id === categories.Outerwear);

    const pick = (arr: any[]) => arr.length > 0 
      ? arr[Math.floor(Math.random() * arr.length)] 
      : null;

    const outfit = {
      jacket: pick(jacket),
      top: pick(tops),
      bottom: pick(bottoms),
      shoes: pick(shoes),
      date: new Date().toDateString(),
    };

    setOotd(outfit);
    await AsyncStorage.setItem(`ootd_${user.id}`, JSON.stringify(outfit));//save it to local storage
  };

  // Load OOTD only once per day
  const loadOOTD = async () => {
    const saved = await AsyncStorage.getItem(`ootd_${user.id}`);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed.date === new Date().toDateString()) {
        setOotd(parsed);
        return;
      }
    }

    generateOOTD();
  };

  // LIKE → SAVE TO FAVORITES

  const saveFavorite = async () => {
    const key = `favorites_${user.id}`;
    const existing = JSON.parse(await AsyncStorage.getItem(key) || "[]");

    existing.push({ ...ootd, savedAt: new Date().toISOString() });

    await AsyncStorage.setItem(key, JSON.stringify(existing));

    alert("Saved to favorites ❤️");
  };


  // DISLIKE → NEW OUTFIT

  const dislikeOutfit = async () => {
    await generateOOTD();
  };

  // WEATHER(later to use weatherApi.ts file )
  const loadWeather = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    const place = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const cityName = place[0]?.city || "";

    const res = await fetch(`${FASTAPI_URL}/weather/?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    // set weather
    setWeather({ ...data, city: cityName })
  };

  useEffect(() => {
    loadOOTD();
    loadWeather();
  }, []);

  const username = user?.email?.split("@")[0] || "User";

  return (
    <View className="flex-1 m-2">

      {/* HEADER */}
      <View className="mt-10 px-5 flex-row items-center justify-between">
        <View>
          <Text className="text-base text-[#6C9A8B] font-semibold">
            Welcome back,
          </Text>
          <Text className="mt-1 text-lg font-extrabold text-[#E8998D]">
            {username} 👋
          </Text>
        </View>

        {weather && (
          <View className="px-3 py-2 rounded-2xl flex-row items-center shadow-md">
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
              style={{ width: 40, height: 40 }}
            />
            <View className="ml-2">
              <Text className="text-sm text-[#6C9A8B]">{weather.city}</Text>
              <Text className="text-lg text-[#E8998D] font-extrabold">
                {weather.temp}°C
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* DAILY HIGHLIGHT */}
      <TouchableOpacity
        onPress={() => router.push("/newspaper-view")}
        className="mt-4 self-center w-[85%] h-32 bg-[#faf7f0] border border-[#e4d9c3] shadow-md p-4 rounded-lg"
      >
        <Text className="text-lg font-bold text-[#6C9A8B]">Today's Highlights</Text>
        <Text className="text-sm text-[#4a3f35] mt-2">
          Tap to read today’s sustainable fashion insights 📖
        </Text>
      </TouchableOpacity>

      {/* OOTD BOX */}
      {ootd && (
        <View className="mt-6 bg-white/90 p-4 rounded-2xl shadow-md border border-[#E8998D]/20">
          <Text className="text-lg font-bold text-[#A1683A] mb-3">
            Outfit of the Day
          </Text>

          {/* Outfit pieces */}
          <View className="flex-row justify-between mb-4">
            {["jacket", "top", "bottom", "shoes"].map(part =>
              ootd[part] ? (
                <View key={part} className="items-center">
                  <Image
                    source={{ uri: ootd[part].image_url }}
                    style={{ width: 60, height: 60, borderRadius: 10 }}
                  />
                  <Text className="text-xs mt-1 capitalize">{part}</Text>
                </View>
              ) : null
            )}
          </View>

          {/* Like / Dislike Buttons */}
          <View className="flex-row justify-center mt-3">

            <TouchableOpacity
              onPress={saveFavorite}
              className="mr-6 bg-[#FFD1DC] px-4 py-2 rounded-xl"
            >
              <Text className="text-[#D12F6B] font-bold text-lg">❤️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={dislikeOutfit}
              className="bg-black px-4 py-2 rounded-xl"
            >
              <Text className="text-[#A1683A] font-bold text-lg">❌</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </View>
  );
}
