import { useAuth } from "@/context/AuthContext";
import { FASTAPI_URL } from "@/IP_Config";
import { categories } from "@/types/items";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getWeather } from "../components/api/weatherApi";


export default function HomeView() {
  const { user } = useAuth();

  const [weather, setWeather] = useState<any>(null);
  const [ootd, setOotd] = useState<any>(null);

  const generateOOTD = async () => {
    const res = await fetch(`${FASTAPI_URL}/items/user/${user.id}`);
    const data = await res.json();
    const all = data.items || [];

    const tops = all.filter((i: any) => i.category_id === categories.Top);
    const bottoms = all.filter((i: any) => i.category_id === categories.Bottom);
    const shoes = all.filter((i: any) => i.category_id === categories.Shoes);
    const jacket = all.filter((i: any) => i.category_id === categories.Outerwear);
    const jumpsuit = all.filter((i: any) => i.category_id === categories.Jumpsuit);

    const pick = (arr: any[]) => (arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null);

    const outfit = {
      jacket: pick(jacket),
      top: pick(tops),
      bottom: pick(bottoms),
      shoes: pick(shoes),
      jumpsuit: pick(jumpsuit),
      date: new Date().toDateString(),
    };

    setOotd(outfit);
    await AsyncStorage.setItem(`ootd_${user.id}`, JSON.stringify(outfit));
  };

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

  const saveFavorite = async () => {
    const key = `favorites_${user.id}`;
    const existing = JSON.parse((await AsyncStorage.getItem(key)) || "[]");
    existing.push({ ...ootd, savedAt: new Date().toISOString() });
    await AsyncStorage.setItem(key, JSON.stringify(existing));
    alert("Saved to favorites");
  };

  const dislikeOutfit = async () => {
    await generateOOTD();
  };

  const loadWeather = async () => {
    getWeather().then((data) => {
      if (data) {
        setWeather(data);
      }
    });
  };

  console.log("weather", weather);


  useEffect(() => {
    loadOOTD();
    loadWeather();
  }, [user.id]);

  const username = user?.email?.split("@")[0] || "User";

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      {/* HEADER */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[12px] tracking-[2px] text-black mt-5">WELCOME BACK</Text>
          <Text className="mt-1 text-[22px] tracking-[0.3px] text-black">
            {username}
          </Text>
        </View>

        {weather && (
          <View className="flex-row items-center border border-[#E6E6E6] px-3 py-2 bg-white" style={{ borderRadius: 4 }}>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }}
              style={{ width: 28, height: 28 }}
            />
            <View className="ml-2">
              <Text className="text-[11px] text-[#6E6E6E]">{weather.city}</Text>
              <Text className="text-[14px] text-black">{weather.main.temp.toFixed(0)}°C</Text>
            </View>
          </View>
        )}
      </View>

      {/* DAILY HIGHLIGHT */}
      <TouchableOpacity
        onPress={() => router.push("/newspaper-view")}
        className="mt-5 border border-[#E6E6E6] bg-white p-4"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-[12px] tracking-[2px] text-black">TODAY</Text>
        <Text className="mt-2 text-[14px] text-[#6E6E6E]">
          Sustainable fashion insights
        </Text>

        <View className="mt-3 border border-black px-3 py-2 self-start" style={{ borderRadius: 4 }}>
          <Text className="text-[12px] tracking-[1.5px] text-black">READ</Text>
        </View>
      </TouchableOpacity>

      {/* OOTD */}
      {ootd && (
        <View className="mt-5 border border-[#E6E6E6] bg-white p-4" style={{ borderRadius: 4 }}>
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-[12px] tracking-[2px] text-black">OUTFIT</Text>
              <Text className="mt-1 text-[16px] text-black">Outfit of the Day</Text>
            </View>

            <TouchableOpacity
              onPress={dislikeOutfit}
              className="border border-[#E6E6E6] px-3 py-2"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-[12px] tracking-[1.5px] text-black">NEW</Text>
            </TouchableOpacity>
          </View>

          {/* Outfit pieces*/}
          <View className="flex-row mt-4">
            {(["jacket", "top", "bottom", "shoes"] as const).map((part) => {
              const item = ootd[part];

              return (
                <View key={part} className="items-center" style={{ width: "25%" }}>
                  {item ? (
                    <>
                      <View
                        className="border border-[#E6E6E6] bg-[#F7F7F7] overflow-hidden"
                        style={{ borderRadius: 4, width: "90%" }}
                      >
                        {/* SMALL + CONTROLLED SIZE */}
                        <View style={{ aspectRatio: 1 }}>
                          <Image
                            source={{ uri: item.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                      </View>

                      <Text className="text-[10px] tracking-[1px] text-[#6E6E6E] mt-2">
                        {part.toUpperCase()}
                      </Text>
                    </>
                  ) : (
                    <View style={{ width: "90%", aspectRatio: 1 }} />
                  )}
                </View>
              );
            })}
          </View>


          {/* Actions */}
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={saveFavorite}
              className="flex-1 border border-black px-4 py-3 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-[12px] tracking-[1.5px] text-black">SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
