import { createFavoriteOutfit } from "@/components/api/favoriteApi";
import { createLoggedOutfit } from "@/components/api/loggedOutfitApi";
import { getOutfitSuggestions } from "@/components/api/outfitSuggestionsApi";
import { setOutfitPreference } from "@/components/api/preferenceApi";
import { generateQuickTryOn as requestQuickTryOn } from "@/components/api/userApi";
import { getWeather } from "@/components/api/weatherApi";
import OccasionSelectorCompact, { OccasionOption } from "@/components/occasionSelector";
import OutfitRow from "@/components/outfitRow";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  message?: string | null;
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
  const [tryOnLoading, setTryOnLoading] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnError, setTryOnError] = useState<string | null>(null);
  const [tryOnModalOpen, setTryOnModalOpen] = useState(false);
  const [loggedOutfit,setLoggedOutfit] = useState(false);
  const [showOOTDModal, setShowOOTDModal] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  const generateQuickTryOn = async () => {

      if (!current) {
        console.log("No current outfit, stopping");
        return;
      }

      setTryOnModalOpen(true);
      setTryOnLoading(true);
      setTryOnResult(null);
      setTryOnError(null);

      try {
        const data = await requestQuickTryOn({
          user_id: user.id,
          top_url: current.top?.processed_img_url ?? null,
          bottom_url: current.bottom?.processed_img_url ?? null,
          shoes_url: current.shoes?.processed_img_url ?? null,
          outerwear_url: current.outerwear?.processed_img_url ?? null,
          jumpsuit_url: current.jumpsuit?.processed_img_url ?? null,
          outfit_type: current.type,
        });

        console.log("Quick try-on response:", data);

        setTryOnResult(data.result_url);
      } catch (e) {
        console.log("Quick try-on error:", e);
        setTryOnError("There was an issue generating your try-on. Please try again later.");
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
      const data = await createLoggedOutfit({
        user_id: user.id,
        outfit_id: outfitId ?? null,
        type: current.type,
        top_id: current.top?.id ?? null,
        bottom_id: current.bottom?.id ?? null,
        shoes_id: current.shoes?.id ?? null,
        outerwear_id: current.outerwear?.id ?? null,
        jumpsuit_id: current.jumpsuit?.id ?? null,
        master_occasion_id: selectedOccasion?.id ?? null,
      });

      setOutfitId(data.outfit_id);
      setLoggedOutfit(true);
      setShowOOTDModal(true);
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

    try {
      const data = await createFavoriteOutfit({
        outfit_id: outfitId ?? null,
        item_ids,
        master_occasion_id: selectedOccasion?.id ?? null,
        name: null,
      });

      setOutfitId(data.outfit_id);
      return true;
    } catch (error) {
      console.log("Favorite failed:", error);
      return false;
    }
  };

  const generateSuggestions = async () => {
    if (!weather || !weather.coord) {
      console.log("Weather or coord not loaded yet.");
      return;
    }

    try {
      const data = await getOutfitSuggestions({
        user_id: user.id,
        lat: weather.coord.lat,
        lon: weather.coord.lon,
        master_occasion_id: selectedOccasion?.id ?? null,
      });

      setPayload(data);
      setIndex(0);
      if (!data.suggestions || data.suggestions.length === 0) {
        setEmptyMessage(
          data.message ?? "No outfit could be generated with the available wardrobe items."
        );
      } else {
        setEmptyMessage(null);
      }
    } catch (error) {
      console.log("suggestions error:", error);
      setPayload(null);
      setEmptyMessage("There was an issue generating outfit suggestions. Please try again later.");
    }
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
    ].filter((itemId): itemId is string => Boolean(itemId));

    try {
      const data = await setOutfitPreference({
        user_id: user.id,
        preference,
        outfit_id: outfitId ?? null,
        item_ids,
      });

      setOutfitId(data.outfit_id);
      return true;
    } catch (_) {
      return false;
    }
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

  const cardH = SCREEN_H * 0.54;
  const headerRightLabel = suggestions.length === 0 ? "GET OUTFIT" : "NEXT";
  const headerRightLabel2 = "OOTD";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 pt-3 pb-3 border-b border-[#E6E6E6] bg-white flex-row items-center justify-between">
        <View>
          <Text className="tracking-[2px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 1.1 }}>
            WEATHER
          </Text>

          <View className="flex-row items-baseline mt-1">
            {weather && weather.main ? (
              <>
                <Text className="tracking-[1px] text-black uppercase" style={{ fontSize: Typography.section.fontSize }}>
                  {weather.main.temp.toFixed(0)}°
                </Text>

                {typeof weather.main.feels_like === "number" && (
                  <Text className="ml-2 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
                    feels {weather.main.feels_like.toFixed(0)}°
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-black" style={{ fontSize: Typography.body.fontSize * 0.75 }}>
                Loading...
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="mr-2">
            <ScreenHelpButton
              title="My Stylist"
              subtitle="Generate outfit suggestions based on the weather and your selected occasion."
              items={[
                "Choose an occasion by clicking ANY before generating outfit ideas.",
                "Use GET OUTFIT or NEXT to cycle through suggestions.",
                "Save a suggestion as a favorite or log it as Outfit of the Day when it works.",
                "Use the feedback buttons under the outfit card to help preference learning.",
              ]}
            />
          </View>

          <OccasionSelectorCompact
            value={selectedOccasion}
            onChange={(o) => {
              setSelectedOccasion(o);
              setPayload(null);
              setIndex(0);
              setEmptyMessage(null);
            }}
          />

          <Pressable
            onPress={suggestions.length === 0 ? generateSuggestions : nextSuggestion}
            className="border border-black bg-white px-4 py-3"
            style={{ borderRadius: 4 }}
          >
            <Text className="tracking-[1.5px] text-black" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              {headerRightLabel}
            </Text>
          </Pressable>

          {suggestions.length > 0 && (
            <Pressable
              onPress={onLogOutfit}
              disabled={loggedOutfit}
              className={`ml-2 border bg-white px-4 py-3 ${loggedOutfit ? "border-[#999999] opacity-50" : "border-black"}`}
              style={{ borderRadius: 4 }}
            >
              <Text className="tracking-[1.5px] text-black" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
                {headerRightLabel2}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

        <Modal
          visible={showOOTDModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOOTDModal(false)}
        >
          <View
            className="flex-1 bg-[rgba(0,0,0,0.35)] justify-center items-center p-6"
          >
            <View
                className="bg-white border border-[#E6E6E6] items-center px-6 py-7"
                style={{ width: 280, borderRadius: 20 }}
              >
              <Text className="mb-3 text-center uppercase tracking-[1.5px] text-black" style={{ fontSize: Typography.header.fontSize }}>
                Outfit Added
              </Text>

              <Text className="mb-5 text-center leading-[22px] text-[#444444]" style={{ fontSize: Typography.body.fontSize }}>
                Your outfit has been added to the calendar.
              </Text>

              <Pressable
                onPress={() => setShowOOTDModal(false)}
                className="border border-black py-2.5 px-[22px] rounded-md"
              >
                <Text className="tracking-[1.2px] text-black" style={{ fontSize: Typography.body.fontSize }}>
                  OK
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      {/* BODY */}
      <ScrollView className="bg-white px-4 pb-4" contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}>
        {current ? (
          <View className="px-4 pt-3 bg-[#F7F7F7]" style={{ borderRadius: 6 }}>
            {current.outerwear && (
              <OutfitRow
                label="OUTERWEAR"
                uri={current.outerwear?.processed_img_url}
                maxH={cardH * 0.35}
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
                    maxH={cardH * 0.35}
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
                await generateQuickTryOn();
                setTryOnModalOpen(true);
              }}
              className="absolute top-3 right-3 border border-black bg-white px-3 py-2"
              style={{ borderRadius: 4 }}
            >
              <Text className="tracking-[1.2px] text-black" style={{ fontSize: Typography.body.fontSize * 0.8 }}>
                TRY ON
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            className="border border-[#E6E6E6] bg-white items-center justify-center"
            style={{ borderRadius: 6, minHeight: SCREEN_H * 0.620 }}
          >
            <Text className="text-center tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              {emptyMessage ? "NO OUTFIT FOUND" : "NO SUGGESTIONS YET"}
            </Text>

            <Text className="mt-2 px-[18px] text-center text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              {emptyMessage ? emptyMessage : 'Press "GET OUTFIT" to generate.'}
            </Text>
          </View>
        )}

        {current && (
        <View
          className="mx-4 mt-4 border border-[#E6E6E6] bg-[#F7F7F7] px-4 py-3"
          style={{ borderRadius: 6 }}
        >
          <View className="flex-row justify-around">
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
        </View>
        )}
        
        <Modal visible={tryOnModalOpen} animationType="slide" transparent>
          <View className="flex-1 bg-black/70 justify-center items-center px-6">
            <View className="w-full bg-white rounded-xl p-4">
              <Text className="mb-3 text-center uppercase tracking-[0.6px] text-black" style={{ fontSize: Typography.section.fontSize }}>
                Try On View
              </Text>

              {/* LOADING STATE */}
              {tryOnLoading && (
                <View className="items-center py-12">

                  <ActivityIndicator size="large" color="black" />

                  <Text className="mt-3 text-[#444444]" style={{ fontSize: Typography.body.fontSize }}>
                    That might take a few seconds...
                  </Text>

                </View>
              )}

              {/* ERROR STATE */}
               {!tryOnLoading && tryOnError && (
                  <View className="items-center py-12">
                    <Text className="mt-3 text-center text-[#444444]" style={{ fontSize: Typography.body.fontSize }}>
                      There was an issue generating your try-on. Please try again later.
                    </Text>

                    <TouchableOpacity
                      onPress={() => setTryOnModalOpen(false)}
                      className="bg-black py-3 rounded mt-6 w-full"
                    >
                      <Text className="text-center text-white" style={{ fontSize: Typography.body.fontSize }}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {/* RESULT IMAGE */}
              {!tryOnLoading && !tryOnError && tryOnResult && (
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
                    <Text className="text-center text-white" style={{ fontSize: Typography.body.fontSize }}>
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

              <Text className="mt-3 tracking-[1px] text-black" style={{ fontSize: Typography.body.fontSize }}>
                Generating Try-On...
              </Text>
            </View>
          </View>
        </Modal>

        <Modal visible={!!feedbackMsg} transparent animationType="fade">
          <View className="flex-1 justify-center items-center">
            <View
              className="bg-white px-6 py-5 items-center"
              style={{ borderRadius: 10, width: 220 }}
            >
              <Text className="text-center tracking-[0.8px] text-black" style={{ fontSize: Typography.body.fontSize * 0.92 }}>
                {feedbackMsg}
              </Text>
            </View>
          </View>
        </Modal>

        <Text
          className="mb-[10px] text-center tracking-[2px] text-[#6E6E6E]"
          style={{ marginTop: current ? 8 : 16, fontSize: Typography.body.fontSize * 0.85 }}
        >
          {index + 1} / {suggestions.length}
        </Text>
        </ScrollView>
    </SafeAreaView>
  );
}