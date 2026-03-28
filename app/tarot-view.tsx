import BackButton from "@/components/backButton";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import { TAROT_CARDS, TarotCard } from "@/types/tarotCards";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.62;
const CARD_H = CARD_W * 1.7;
const CACHE_KEY = "tarot_daily_cache";

function getTodayKey() {
  return new Date().toDateString();
}

function getFormattedDate() {
  return new Date()
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();
}

export default function TarotView() {
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [card, setCard] = useState<TarotCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  function getDailyCard(): TarotCard {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return TAROT_CARDS[seed % TAROT_CARDS.length];
  }

  useEffect(() => {
    loadDailyCard();
  }, []);

  const loadDailyCard = async () => {
    const todayKey = getTodayKey();
    const cached = await AsyncStorage.getItem(CACHE_KEY);

    if (cached) {
      const { date, cardName, flipped: cachedFlipped } = JSON.parse(cached);
      if (date === todayKey) {
        const found = TAROT_CARDS.find((c) => c.name === cardName);
        if (found) {
          setCard(found);
          setFlipped(!!cachedFlipped);
          flipAnim.setValue(cachedFlipped ? 1 : 0);
          return;
        }
      }
    }

    const daily = getDailyCard();
    setCard(daily);
    setFlipped(false);
    flipAnim.setValue(0);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        date: todayKey,
        cardName: daily.name,
        flipped: false,
      })
    );
  };

  const handleFlip = async () => {
    if (flipped || !card) return;

    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setFlipped(true);
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        date: getTodayKey(),
        cardName: card.name,
        flipped: true,
      })
    );
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  if (!card) return null;

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row justify-between mt-12 px-3">
        <BackButton />
        <ScreenHelpButton
          title="Daily Reading"
          subtitle="This screen gives you one tarot reading per day."
          items={[
            "Tap the card to flip it and reveal today’s reading.",
            "The same card stays visible for the rest of the day.",
            "Come back tomorrow for a new card and message.",
          ]}
        />
      </View>

      <View className="px-4 pt-2 pb-3">
        <Text
          className="text-[#9A9A9A]"
          style={[
            Typography.body,
            {
              fontSize: Typography.body.fontSize * 0.75,
              letterSpacing: 2.5,
            },
          ]}
        >
          {getFormattedDate()}
        </Text>

        <Text
          className="text-black mt-0.5"
          style={[
            Typography.header,
            {
              fontSize: Typography.header.fontSize * 1.1,
              letterSpacing: 0.3,
            },
          ]}
        >
          Daily Reading
        </Text>
      </View>

      <View className="h-[1px] bg-[#E6E6E6]" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD */}
        <View className="items-center mt-8 mb-6">
          <TouchableOpacity
            onPress={handleFlip}
            activeOpacity={flipped ? 1 : 0.9}
            style={{ width: CARD_W, height: CARD_H }}
          >
            {/* CARD BACK */}
            <Animated.View
              className="absolute rounded-2xl overflow-hidden"
              style={{
                width: CARD_W,
                height: CARD_H,
                opacity: frontOpacity,
                transform: [{ rotateY: frontRotate }],
                backfaceVisibility: "hidden",
              }}
            >
              <View className="flex-1 rounded-2xl bg-[#fff9f9] items-center justify-center border border-[#333]">
                {/* decorative back pattern */}
                <View
                  className="border border-[#333] rounded-lg items-center justify-center"
                  style={{
                    width: CARD_W * 0.75,
                    height: CARD_H * 0.75,
                  }}
                >
                  <Text className="text-[#333] text-4xl">✦</Text>
                  <Text
                    className="text-[#444] mt-4"
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize * 0.7,
                        letterSpacing: 3,
                      },
                    ]}
                  >
                    TAP TO REVEAL
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* CARD FRONT */}
            <Animated.View
              className="absolute rounded-2xl overflow-hidden"
              style={{
                width: CARD_W,
                height: CARD_H,
                opacity: backOpacity,
                transform: [{ rotateY: backRotate }],
                backfaceVisibility: "hidden",
              }}
            >
              <View className="flex-1 rounded-2xl bg-[#fff9f9] items-center justify-between border border-[#2A2A2A] py-7 px-5">
                {/* top label */}
                <Text
                  className="text-[#555]"
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.68,
                      letterSpacing: 3,
                    },
                  ]}
                >
                  WARDROBE TAROT
                </Text>

                {/* symbol */}
                <Text className="text-black text-[52px]">{card.symbol}</Text>

                {/* colour swatch */}
                <View className="items-center gap-2">
                  <View
                    className="border border-[#333]"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: card.colourHex,
                    }}
                  />
                  <Text
                    className="text-[#666]"
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize * 0.72,
                        letterSpacing: 1.5,
                      },
                    ]}
                  >
                    {card.colour.toUpperCase()}
                  </Text>
                </View>

                {/* card name */}
                <View className="items-center">
                  <Text
                    className="text-[#555] mb-1"
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize * 0.68,
                        letterSpacing: 3,
                      },
                    ]}
                  >
                    YOUR CARD
                  </Text>
                  <Text
                    className="text-black text-center"
                    style={[
                      Typography.section,
                      {
                        letterSpacing: 0.5,
                      },
                    ]}
                  >
                    {card.name}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {!flipped && (
            <Text
              className="text-[#C0C0C0] mt-4"
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.75,
                  letterSpacing: 1.5,
                },
              ]}
            >
              TAP THE CARD
            </Text>
          )}
        </View>

        {/* READING — only visible after flip */}
        {flipped && (
          <View className="px-4 gap-4">
            {/* Archetype badge */}
            <View className="items-center">
              <View className="border border-[#E6E6E6] px-4 py-2 rounded">
                <Text
                  className="text-black"
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.72,
                      letterSpacing: 2.5,
                    },
                  ]}
                >
                  {card.archetype.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Style energy */}
            <View className="border border-[#E6E6E6] px-4 py-4 rounded">
              <Text
                className="text-[#9A9A9A] mb-2"
                style={[
                  Typography.body,
                  {
                    fontSize: Typography.body.fontSize * 0.72,
                    letterSpacing: 2,
                  },
                ]}
              >
                STYLE ENERGY
              </Text>
              <Text
                className="text-black"
                style={[
                  Typography.body,
                  {
                    lineHeight: Typography.body.fontSize * 1.6,
                  },
                ]}
              >
                {card.energy}
              </Text>
            </View>

            {/* Colour to wear */}
            <View className="border border-[#E6E6E6] px-4 py-4 flex-row items-center rounded gap-[14px]">
              <View
                className="border border-[#E6E6E6] shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: card.colourHex,
                }}
              />
              <View className="flex-1">
                <Text
                  className="text-[#9A9A9A] mb-1"
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.72,
                      letterSpacing: 2,
                    },
                  ]}
                >
                  COLOUR TO WEAR
                </Text>
                <Text
                  className="text-black"
                  style={[
                    Typography.body,
                    undefined,
                  ]}
                >
                  {card.colour}
                </Text>
              </View>
            </View>

            {/* Reading message */}
            <View className="bg-[#111] px-4 py-5 rounded">
              <Text
                className="text-[#555] mb-2.5"
                style={[
                  Typography.body,
                  {
                    fontSize: Typography.body.fontSize * 0.72,
                    letterSpacing: 2,
                  },
                ]}
              >
                YOUR READING
              </Text>
              <Text
                className="text-[#E0E0E0]"
                style={[
                  Typography.body,
                  {
                    lineHeight: Typography.body.fontSize * 1.7,
                  },
                ]}
              >
                {card.message}
              </Text>
            </View>

            {/* Come back tomorrow */}
            <Text
              className="text-[#C0C0C0] text-center mt-2"
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.75,
                  letterSpacing: 1.5,
                },
              ]}
            >
              A NEW CARD AWAITS TOMORROW
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}