import { FASTAPI_URL } from "@/IP_Config";
import { getWeather } from "@/components/api/weatherApi";
import OccasionSelectorCompact, { OccasionOption } from "@/components/occasionSelector";
import OutfitRow from "@/components/outfitRow";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, SafeAreaView, Text, View } from "react-native";

type OutfitItem = {
  id: string;
  image_url?: string;
  processed_img_url?: string;
  img_description?: string;
  category_id?: number;
  subcategory_id?: number;
};

type Outfit = {
  type: "onepiece" | "twopiece"; // "onepiece" or "twopiece"
  top: OutfitItem | null;
  bottom: OutfitItem | null;
  shoes: OutfitItem | null;
  outerwear?: OutfitItem | null;
  jumpsuit?: OutfitItem | null;
};

type SuggestionsPayload = {
  weather: { temp: number; icon: string; wind: number };
  rules: { allowed_seasons: string[]; include_jacket: boolean };
  suggestions: Outfit[];
};



const { height: SCREEN_H } = Dimensions.get("window");

export default function SuggestionsScreen() {
   const [weather, setWeather] = useState<any>(null);
   const { user } = useAuth();
  console.log("Rendering My Stylist with weather:", weather);
   useEffect(() => {
    getWeather().then((w) => {
      console.log("Fetched weather:", w);
      setWeather(w);
    });
  }, []);



  const [selectedOccasion, setSelectedOccasion] = useState<OccasionOption | null>(null);
  const [payload, setPayload] = useState<SuggestionsPayload | null>(null);
  const suggestions = payload?.suggestions ?? [];
  const [index, setIndex] = useState(0);
  const current = suggestions[index] ?? null;
  const [outfitId, setOutfitId] = useState<string | null>(null);

  // Whenever we move to next suggestion, reset outfitId so that it knows it's a new outfit
  useEffect(() => {
  setOutfitId(null);
}, [index]);

useEffect(() => {
  setOutfitId(null);
  setIndex(0);
}, [payload]);


  const logOutfit = async () => {
  if (!current) return;

  try {
    const res = await fetch(`${FASTAPI_URL}/logged_outfits/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        outfit_id: outfitId ?? null,
        type: current.type,
        top_id: current.top?.id ?? null,
        bottom_id: current.bottom?.id ?? null,
        shoes_id: current.shoes?.id ?? null,
        outerwear_id: current.outerwear?.id ?? null,
        jumpsuit_id: current.jumpsuit?.id ?? null,
        name: null, 
      }),
    });

    console.log("Log outfit response status:", res);

    const data = await res.json();
    if (!res.ok) {
      console.log("Log outfit failed:", data);
      return;
    }

    console.log("Logged outfit:", data);
    setOutfitId(data.outfit_id); // { wear_log_id, outfit_id }
  } catch (error) {
    console.error("Error logging outfit:", error);
  }
};


const favoriteOutfit = async () => {
  if (!current) return;

  try {
    const res = await fetch(`${FASTAPI_URL}/outfits/${outfitId}/favorite`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        outfit_id: outfitId,
      }),
    });

    console.log("Favorite outfit response status:", res);
    const data = await res.json();
    if (!res.ok) {
      console.log("Favorite outfit failed:", data);
      return;
    }
    console.log("Favorited outfit:", data);
  } catch (error) {
    console.error("Error favoriting outfit:", error);
  }
};  

const onFavorite = async () => {
  if (!current) return;

  const item_ids = [
    current.top?.id,
    current.bottom?.id,
    current.shoes?.id,
    current.outerwear?.id,
    current.jumpsuit?.id,
  ].filter(Boolean);

  const res = await fetch(`${FASTAPI_URL}/favorites/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.id,
      outfit_id: outfitId ?? null,
      item_ids,
      name: null,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("Favorite failed:", data);
    return;
  }

  console.log("Favorited:", data);

  // VERY IMPORTANT
  setOutfitId(data.outfit_id);
};

  const generateSuggestions = async () => {
    // Prevent running if weather or coord is not ready
    if (!weather || !weather.coord) {
      console.log("Weather or coord not loaded yet.");
      return;
    }
    const res = await fetch(`${FASTAPI_URL}/outfitSuggestions/get_outfit_suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: user.id,
        lat: weather.coord.lat,
        lon: weather.coord.lon,
        occasion_id: selectedOccasion?.master_id ?? null,
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      console.log("suggestions error:", msg);
      return;
    }

    const data = await res.json();
    setPayload(data);
    setIndex(0);
  };

  const nextSuggestion = () => {
  if (suggestions.length === 0) return;
  setIndex((prev) => (prev + 1) % suggestions.length);
};

const onLogOutfit = () => {  
  logOutfit();
};


const setPreference = async (preference: "like" | "dislike") => {
  const item_ids = [
    current.top?.id,
    current.bottom?.id,
    current.shoes?.id,
    current.outerwear?.id,
    current.jumpsuit?.id,
  ].filter(Boolean);

  const res = await fetch(`${FASTAPI_URL}/preferences/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.id,
      preference,
      outfit_id: outfitId ?? null,
      item_ids, // fallback if outfitId is null
    }),
  });

  const data = await res.json();
  if (!res.ok) return false;

  // IMPORTANT: backend should return outfit_id
  setOutfitId(data.outfit_id);
  return true;
};


  const onLike = async () => {
  if (!current) return;

  const ok = await setPreference("like");
  if (!ok) return;

  // 3) move on
  nextSuggestion();
};

const onDislike = async () => {
  if (!current) return;

  const ok = await setPreference("dislike");
  if (!ok) return;

  nextSuggestion();
};
  //const onWearingToday = () => nextSuggestion();
  const cardH = SCREEN_H * 0.62;

  const headerRightLabel = suggestions.length === 0 ? "GET OUTFIT" : "NEXT";
  const headerRightLabel2 =  "OOTD"; ;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER  */}
      <View className="px-4 pt-3 pb-3 border-b border-[#E6E6E6] bg-white flex-row items-center justify-between">
        {/* Weather left */}
        <View>
          <Text className="text-[11px] tracking-[2px] text-[#6E6E6E]">WEATHER</Text>
          <View className="flex-row items-baseline mt-1">
            {weather && weather.main ? (
              <>
                <Text className="text-[18px] tracking-[1px] text-black">
                  {weather.main.temp.toFixed(0)}°
                </Text>
                {typeof weather.main.feels_like === "number" && (
                  <Text className="ml-2 text-[12px] text-[#6E6E6E]">
                    feels {weather.main.feels_like.toFixed(0)}°
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-[10px] text-black">
                Loading...
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <OccasionSelectorCompact
            value={selectedOccasion}
            onChange={(o) => {
              setSelectedOccasion(o);
              setPayload(null);
              setIndex(0);
            }}
          />

          {/* Action right */}
          <Pressable
            onPress={suggestions.length === 0 ? generateSuggestions : nextSuggestion}
            className="border border-black bg-white px-4 py-3"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-[12px] tracking-[1.5px] text-black">
              {headerRightLabel}
            </Text>
          </Pressable>

          {suggestions.length > 0 && (
            <Pressable
              onPress={onLogOutfit}
              className="ml-2 border border-black bg-white px-4 py-3"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-[12px] tracking-[1.5px] text-black">
                {headerRightLabel2}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      

      {/* BODY */}
      <View className="flex-1 px-4  pb-4">
        {current ? (
              <View className="flex-1 px-4 pt-4 pb-4 bg-[#F7F7F7]">
                {current.outerwear && (
                  <OutfitRow
                    label="OUTERWEAR"
                    uri={current.outerwear?.processed_img_url}
                    maxH={cardH * 0.30}
                  />
                )}

                <View style={{ height: cardH }} className="justify-start">
                  {current.jumpsuit ? (
                    <>
                      <OutfitRow label="JUMPSUIT" uri={current.jumpsuit?.processed_img_url} maxH={cardH * 0.50} />
                      <OutfitRow label="SHOES" uri={current.shoes?.processed_img_url} maxH={cardH * 0.40} />
                    </>
                  ) : (
                    <>
                      <OutfitRow label="TOP" uri={current.top?.processed_img_url} maxH={cardH * 0.30} />
                      <OutfitRow label="BOTTOM" uri={current.bottom?.processed_img_url} maxH={cardH * 0.35} />
                      <OutfitRow label="SHOES" uri={current.shoes?.processed_img_url} maxH={cardH * 0.35} />
                    </>
                  )}
                </View>
              </View>
          ) : (
            // your NO SUGGESTIONS state
            <View
              className="border border-[#E6E6E6] bg-white items-center justify-center"
              style={{ borderRadius: 6, height: SCREEN_H * 0.62 }}
            >
              <Text className="text-[12px] tracking-[1.8px] text-[#6E6E6E]">
                NO SUGGESTIONS YET
              </Text>
              <Text className="mt-2 text-[12px] text-[#6E6E6E]">
                Press “GET OUTFIT” to generate.
              </Text>
            </View>
          )}


          
            {/* Footer actions (tinder-ish) */}
            <View className="absolute bottom-0 left-0 right-0 flex-row justify-around py-4">
              <Pressable onPress={onDislike} >
                <View className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center">
                  <Text className="text-[18px] text-white">X</Text> 
                </View>
              </Pressable>

              <Pressable onPress={onLike} >
              <View className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center">
                  <Text className="text-[18px] text-white">✓</Text>
                  </View>
              </Pressable>

              <Pressable onPress={onFavorite} >
              <View className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center">
                  <Text className="text-[18px] text-white">👗</Text>
                  </View>
              </Pressable>
            </View>

            {/* Counter */}
            <Text className="mt-3 text-center text-[11px] tracking-[2px] text-[#6E6E6E]">
              {index + 1} / {suggestions.length}
            </Text>      
       
      </View>
    </SafeAreaView>
  );
}


