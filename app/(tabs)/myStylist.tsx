import { FASTAPI_URL } from "@/IP_Config";
import { getWeather } from "@/components/api/weatherApi";
import OccasionSelectorCompact, { OccasionOption } from "@/components/occasionSelector";
import OutfitRow from "@/components/outfitRow";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { authFetch } from "@/supabase/supabaseConfig";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

type OutfitItem = {
  id: string;
  image_url?: string;
  processed_img_url?: string;
  img_description?: string;
  category_id?: number;
  subcategory_id?: number;
};

type Outfit = {
  type: "onepiece" | "twopiece";
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
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [selectedOccasion, setSelectedOccasion] = useState<OccasionOption | null>(null);
  const [payload, setPayload] = useState<SuggestionsPayload | null>(null);
  const suggestions = payload?.suggestions ?? [];
  const [index, setIndex] = useState(0);
  const current = suggestions[index] ?? null;
  const [outfitId, setOutfitId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [userTryOnPhoto, setUserTryOnPhoto] = useState<string | null>(null);

  const [tryOnModalOpen, setTryOnModalOpen] = useState(false);

  const generateQuickTryOn = async () => {
      console.log("TRY ON BUTTON PRESSED");
      console.log("generateQuickTryOn called");
      console.log("current:", current);

      if (!current) {
        console.log("No current outfit, stopping");
        return;
      }

      setTryOnModalOpen(true);
      setTryOnLoading(true);
      setTryOnResult(null);

      try {
        const res = await authFetch(`${FASTAPI_URL}/virtual_tryon/quick`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            top_url: current.top?.processed_img_url ?? null,
            bottom_url: current.bottom?.processed_img_url ?? null,
            shoes_url: current.shoes?.processed_img_url ?? null,
            outerwear_url: current.outerwear?.processed_img_url ?? null,
            jumpsuit_url: current.jumpsuit?.processed_img_url ?? null,
            outfit_type: current.type,
          }),
        });

        const data = await res.json();
        console.log("Quick try-on response:", data);

        if (!res.ok) {
          console.log("Try-on failed:", data);
          return;
        }

        setTryOnResult(`${FASTAPI_URL}/${data.result_path}`);
      } catch (e) {
        console.log("Quick try-on error:", e);
      } finally {
        setTryOnLoading(false);
      }
    };
  useEffect(() => {
    getWeather().then((w) => {
      setWeather(w);
    });
  }, []);

  useEffect(() => {
    setOutfitId(null);
  }, [index]);

  useEffect(() => {
    setOutfitId(null);
    setIndex(0);
  }, [payload]);

  const showFeedbackAndContinue = (message: string, nextStep?: () => void) => {
    setFeedbackMsg(message);

    setTimeout(() => {
      setFeedbackMsg(null);
      nextStep?.();
    }, 700);
  };

  const logOutfit = async () => {
    if (!current) return;

    try {
      const res = await authFetch(`${FASTAPI_URL}/logged_outfits/`, {
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
          master_occasion_id: selectedOccasion?.id ?? null,
          name: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Log outfit failed:", data);
        return;
      }

      setOutfitId(data.outfit_id);
    } catch (error) {
      console.error("Error logging outfit:", error);
    }
  };

  const onFavorite = async () => {
    if (!current) return false;
    const item_ids = [
      current.outerwear?.id ?? null, // slot 0
      current.top?.id ?? null,       // slot 1
      current.bottom?.id ?? null,    // slot 2
      current.shoes?.id ?? null,     // slot 3
      current.jumpsuit?.id ?? null,  // slot 4
    ];

    const res = await authFetch(`${FASTAPI_URL}/favorites/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outfit_id: outfitId ?? null,
        item_ids,
        master_occasion_id: selectedOccasion?.id ?? null,
        name: null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Favorite failed:", data);
      return false;
    }

    setOutfitId(data.outfit_id);
    return true;
  };

  const generateSuggestions = async () => {
    if (!weather || !weather.coord) {
      console.log("Weather or coord not loaded yet.");
      return;
    }

    const res = await authFetch(`${FASTAPI_URL}/outfitSuggestions/get_outfit_suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        lat: weather.coord.lat,
        lon: weather.coord.lon,
        master_occasion_id: selectedOccasion?.id ?? null,
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
    if (!current) return false;

    const item_ids = [
      current.top?.id,
      current.bottom?.id,
      current.shoes?.id,
      current.outerwear?.id,
      current.jumpsuit?.id,
    ].filter(Boolean);

    const res = await authFetch(`${FASTAPI_URL}/preferences/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        preference,
        outfit_id: outfitId ?? null,
        item_ids,
      }),
    });

    const data = await res.json();
    if (!res.ok) return false;

    setOutfitId(data.outfit_id);
    return true;
  };

  const onLike = async () => {
    if (!current) return false;
    return await setPreference("like");
  };

  const onDislike = async () => {
    if (!current) return false;
    return await setPreference("dislike");
  };

  const handleLike = async () => {
    try {
      const ok = await onLike();
      if (!ok) return;
      showFeedbackAndContinue("Outfit liked!", nextSuggestion);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDislike = async () => {
    try {
      const ok = await onDislike();
      if (!ok) return;
      showFeedbackAndContinue("Outfit disliked!", nextSuggestion);
    } catch (e) {
      console.log(e);
    }
  };

  const handleFavorite = async () => {
    try {
      const ok = await onFavorite();
      if (!ok) return;
      showFeedbackAndContinue("Saved to favorites!", nextSuggestion);
    } catch (e) {
      console.log(e);
    }
  };

  const cardH = SCREEN_H * 0.62;
  const headerRightLabel = suggestions.length === 0 ? "GET OUTFIT" : "NEXT";
  const headerRightLabel2 = "OOTD";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 pt-3 pb-3 border-b border-[#E6E6E6] bg-white flex-row items-center justify-between">
        <View>
          <Text
            style={[
              Typography.body,
              {
                fontSize: Typography.body.fontSize * 1.1,
                letterSpacing: 2,
                color: "#6E6E6E",
              },
            ]}
          >
            WEATHER
          </Text>

          <View className="flex-row items-baseline mt-1">
            {weather && weather.main ? (
              <>
                <Text
                  style={[
                    Typography.section,
                    {
                      letterSpacing: 1,
                      color: "#000",
                    },
                  ]}
                >
                  {weather.main.temp.toFixed(0)}°
                </Text>

                {typeof weather.main.feels_like === "number" && (
                  <Text
                    style={[
                      Typography.body,
                      {
                        marginLeft: 8,
                        fontSize: Typography.body.fontSize * 0.85,
                        color: "#6E6E6E",
                      },
                    ]}
                  >
                    feels {weather.main.feels_like.toFixed(0)}°
                  </Text>
                )}
              </>
            ) : (
              <Text
                style={[
                  Typography.body,
                  {
                    fontSize: Typography.body.fontSize * 0.75,
                    color: "#000",
                  },
                ]}
              >
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

          <Pressable
            onPress={suggestions.length === 0 ? generateSuggestions : nextSuggestion}
            className="border border-black bg-white px-4 py-3"
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
              {headerRightLabel}
            </Text>
          </Pressable>

          {suggestions.length > 0 && (
            <Pressable
              onPress={onLogOutfit}
              className="ml-2 border border-black bg-white px-4 py-3"
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
                {headerRightLabel2}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* BODY */}
      <ScrollView className="flex-1 px-4 pb-4">
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
                  <OutfitRow
                    label="JUMPSUIT"
                    uri={current.jumpsuit?.processed_img_url}
                    maxH={cardH * 0.5}
                  />
                  <OutfitRow
                    label="SHOES"
                    uri={current.shoes?.processed_img_url}
                    maxH={cardH * 0.4}
                  />
                </>
              ) : (
                <>
                  <OutfitRow
                    label="TOP"
                    uri={current.top?.processed_img_url}
                    maxH={cardH * 0.3}
                  />
                  <OutfitRow
                    label="BOTTOM"
                    uri={current.bottom?.processed_img_url}
                    maxH={cardH * 0.35}
                  />
                  <OutfitRow
                    label="SHOES"
                    uri={current.shoes?.processed_img_url}
                    maxH={cardH * 0.33}
                  />
                </>
              )}
            </View>

            <Pressable
              onPress={async () => {
                console.log("TRY ON BUTTON PRESSED");
                await generateQuickTryOn();
                setTryOnModalOpen(true);
              }}
              className="absolute top-3 right-3 border border-black bg-white px-3 py-2"
              style={{ borderRadius: 4 }}
            >
              <Text
                style={[
                  Typography.body,
                  { fontSize: Typography.body.fontSize * 0.8, letterSpacing: 1.2 },
                ]}
              >
                TRY ON
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            className="border border-[#E6E6E6] bg-white items-center justify-center"
            style={{ borderRadius: 6, height: SCREEN_H * 0.62 }}
          >
            <Text
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.85,
                  letterSpacing: 1.8,
                  color: "#6E6E6E",
                },
              ]}
            >
              NO SUGGESTIONS YET
            </Text>

            <Text
              style={[
                Typography.body,
                {
                  marginTop: 8,
                  fontSize: Typography.body.fontSize * 0.85,
                  color: "#6E6E6E",
                },
              ]}
            >
              Press “GET OUTFIT” to generate.
            </Text>
          </View>
        )}

        <View className="absolute bottom-0 left-0 right-0 flex-row justify-around py-4">
          <Pressable onPress={handleDislike}>
            <View className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center">
              <Ionicons name="thumbs-down" size={22} color="black" />
            </View>
          </Pressable>

          <Pressable onPress={handleFavorite}>
            <View className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center">
              <Ionicons name="heart" size={22} color="black" />
            </View>
          </Pressable>

          <Pressable onPress={handleLike}>
            <View className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center">
              <Ionicons name="thumbs-up" size={22} color="black" />
            </View>
          </Pressable>
        </View>
        <Modal visible={tryOnModalOpen} animationType="slide" transparent>
          <View className="flex-1 bg-black/70 justify-center items-center px-6">

            <View className="w-full bg-white rounded-xl p-4">

              {/* LOADING STATE */}
              {tryOnLoading && (
                <View className="items-center py-12">

                  <ActivityIndicator size="large" color="black" />

                  <Text
                    style={[
                      Typography.body,
                      { marginTop: 12, color: "#444" },
                    ]}
                  >
                    Generating try-on...
                  </Text>

                </View>
              )}

              {/* RESULT IMAGE */}
              {!tryOnLoading && tryOnResult && (
                <>
                  <Image
                    source={{ uri: tryOnResult }}
                    style={{
                      width: "100%",
                      height: 400,
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                    resizeMode="contain"
                  />

                  <TouchableOpacity
                    onPress={() => setTryOnModalOpen(false)}
                    className="bg-black py-3 rounded"
                  >
                    <Text
                      style={[
                        Typography.body,
                        { color: "white", textAlign: "center" },
                      ]}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              )}

            </View>

          </View>
        </Modal>


        <Modal visible={tryOnLoading} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/30">
            <View
              className="bg-white px-6 py-6 items-center"
              style={{ borderRadius: 10 }}
            >
              <ActivityIndicator size="large" color="black" />

              <Text
                style={[
                  Typography.body,
                  { marginTop: 12, letterSpacing: 1 }
                ]}
              >
                Generating Try-On...
              </Text>
            </View>
          </View>
        </Modal>

        <Modal visible={!!feedbackMsg} transparent animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/20">
            <View
              className="bg-white px-6 py-5 items-center"
              style={{ borderRadius: 10, width: 220 }}
            >
              <Text
                style={[
                  Typography.body,
                  {
                    fontSize: Typography.body.fontSize * 0.92,
                    letterSpacing: 0.8,
                    color: "#000",
                    textAlign: "center",
                  },
                ]}
              >
                {feedbackMsg}
              </Text>
            </View>
          </View>
        </Modal>

        <Text
          style={[
            Typography.body,
            {
              marginTop: 20,
              textAlign: "center",
              fontSize: Typography.body.fontSize * 0.85,
              letterSpacing: 2,
              color: "#6E6E6E",
            },
          ]}
        >
          {index + 1} / {suggestions.length}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}