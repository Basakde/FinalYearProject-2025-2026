
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/types/items";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function HomeView() {
  const [weather, setWeather] = useState<any>(null);
  const [city,setCity] = useState<string>("");
  const [ootd, setOotd] = useState<any>(null);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<any[]>([]);

  const FASTAPI_URL = "http://192.168.0.12:8000";

  const generateOOTD = async () => {

  const res = await fetch(`${FASTAPI_URL}/items/user/${user.id}`);
  const data = await res.json();
  const all = data.items || [];

  const tops = all.filter((i: any) => i.category_id === categories.Top);
  const bottoms = all.filter((i: any) => i.category_id === categories.Bottom);
  const shoes = all.filter((i: any) => i.category_id === categories.Shoes);
  const jacket = all.filter((i: any) => i.category_id === categories.Outerwear);

  const pickRandom = (arr: any[]) =>
    arr.length > 0 ? arr[Math.floor(Math.random() * arr.length/2)] : null;

  const newOOTD = {
    top: pickRandom(tops),
    bottom: pickRandom(bottoms),
    shoes: pickRandom(shoes),
    jacket: pickRandom(jacket),
    date: new Date().toDateString(), // <-- save today's date
  };

  setOotd(newOOTD);
  await AsyncStorage.setItem("ootd", JSON.stringify(newOOTD));
};

  
  const username = user?.email
  ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
  : "User";

   // WEATHER FETCH 
  // ---------------------------------------------------------
  const getWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    let loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    const place = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const cityName = place[0]?.city;

    const res = await fetch(`${FASTAPI_URL}/weather/?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    const weatherData = {
      ...data,
      city: cityName || "",
      timestamp: Date.now(),
    };

    setWeather(weatherData);
    setCity(cityName || "");

    await AsyncStorage.setItem("weatherCache", JSON.stringify(weatherData));
  };

  const loadWeather = async () => {
    const cache = await AsyncStorage.getItem("weatherCache");

    if (cache) {
      const parsed = JSON.parse(cache);
      const age = (Date.now() - parsed.timestamp) / 1000 / 60; // minutes old

      // Use existing weather if < 15 min old
      if (age < 15) {
        setWeather(parsed);
        setCity(parsed.city);
        return;
      }
    }

    // Otherwise fetch new weather
    getWeather();
  };

  const loadOOTD = async () => {
  const saved = await AsyncStorage.getItem("ootd");

  if (saved) {
    const parsed = JSON.parse(saved);

    // If the stored date matches today → reuse outfit
    if (parsed.date === new Date().toDateString()) {
      setOotd(parsed);
      return;
    }
  }

  // If no OOTD or outdated → generate new one
  generateOOTD();
};


useEffect(() => {
  getWeather();
  loadOOTD(); // <-- only generate when needed
}, []);


  return (
  <View className="flex-1 m-2">

      {/* HEADER ROW */}
      <View className="mt-10 px-5 flex-row items-center justify-between">


      {/* WELCOME BUBBLE — BELOW WEATHER BADGE */}
        <View className=" px-4 py-3 rounded-2xl shadow-md ">

          <Text className="text-base text-[#6C9A8B] font-semibold">Welcome back,</Text>

          <Text className="mt-1 text-lg font-extrabold text-[#E8998D] ">
            {username} 👋
          </Text>

        </View>

        {/* WEATHER BADGE TOP RIGHT */}
      
          {weather && (
          <View className="px-3 py-2 rounded-2xl flex-row items-center shadow-md">
            
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }}
              style={{ width: 40, height: 40 }}
            />

            <View className="ml-2">
              <Text className="text-sm font-semibold text-[#6C9A8B]">{city}</Text>
              <Text className="text-lg font-extrabold text-[#E8998D]">{weather.temp}°C</Text>
            </View>

          </View>
          )}

      </View>
      <TouchableOpacity
            onPress={() => router.push("/newspaper-view")}
            className="mt-4 self-center w-[85%] h-32  bg-[#faf7f0] 
                      border border-[#e4d9c3] shadow-md p-4 rounded-lg"
          >
            <Text className="text-lg font-bold text-[#6C9A8B]">Today's Highlights</Text>
            <Text className="text-sm text-[#4a3f35] mt-2">
              Tap to read today’s sustainable fashion insights 📖
            </Text>
        </TouchableOpacity>


        {/* OUTFIT OF THE DAY BOX */}
       {ootd && (
      <View className="mt-6 bg-white/90 p-4 rounded-2xl shadow-md border border-[#E8998D]/20">

        <Text className="text-lg font-bold text-[#A1683A] mb-3">
          Outfit of the Day
        </Text>

        <View className="flex-row justify-between">

          {/* JACKETS */}
          {ootd.jacket && (
            <View className="items-center">
              <Image
                source={{ uri: ootd.jacket.image_url }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
              />
              <Text className="text-xs mt-1">Jacket</Text>
            </View>
          )}

          {/* TOP */}
          {ootd.top && (
            <View className="items-center">
              <Image
                source={{ uri: ootd.top.image_url }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
              />
              <Text className="text-xs mt-1">Top</Text>
            </View>
          )}

          {/* BOTTOM */}
          {ootd.bottom && (
            <View className="items-center">
              <Image
                source={{ uri: ootd.bottom.image_url }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
              />
              <Text className="text-xs mt-1">Bottom</Text>
            </View>
          )}

          {/* SHOES */}
          {ootd.shoes && (
            <View className="items-center">
              <Image
                source={{ uri: ootd.shoes.image_url }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
              />
              <Text className="text-xs mt-1">Shoes</Text>
            </View>
          )}

        </View>

      </View>
    )}
    </View>
  );
}


