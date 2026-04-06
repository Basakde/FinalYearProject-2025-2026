import { createTypography } from "@/constants/theme";
import { useFontScale } from "@/context/FontScaleContext";
import { TAROT_CARDS } from "@/types/tarotCards";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.28;
const CARD_H = CARD_W * 1.65;
const CACHE_KEY = "tarot_daily_cache";

type TarotCard = {
  name: string;
  symbol: string;
  energy: string;
  colour: string;
  colourHex: string;
  message: string;
  archetype: string;
};


function getDailyCard(): TarotCard {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return TAROT_CARDS[seed % TAROT_CARDS.length];
}

export default function DailyTarotWidget() {
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [card, setCard] = useState<TarotCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDailyCard();
  }, []);

  const loadDailyCard = async () => {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { date, cardName } = JSON.parse(cached);
      if (date === new Date().toDateString()) {
        const found = TAROT_CARDS.find((c) => c.name === cardName);
        if (found) { setCard(found); return; }
      }
    }
    const daily = getDailyCard();
    setCard(daily);
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date: new Date().toDateString(), cardName: daily.name })
    );
  };

  const handleFlip = () => {
    if (flipped) return;
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => setFlipped(true));
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
    <View className="mx-4 mt-5 border border-[#E6E6E6] bg-white px-4 pt-4 pb-4 rounded-[4px]">
      {/* Widget header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text
            className="tracking-[2.5px] text-[#9A9A9A]"
            style={{ fontSize: Typography.body.fontSize * 0.90 }}
          >
            DAILY READING
          </Text>
          <Text
            className="mt-0.5 text-black"
            style={{ fontSize: Typography.section.fontSize }}
          >
            Your Card Today
          </Text>
        </View>

        {!flipped && (
          <Text
            className="tracking-[1.5px] text-[#C0C0C0]"
            style={{ fontSize: Typography.body.fontSize * 0.90 }}
          >
            TAP TO REVEAL
          </Text>
        )}
      </View>

      {/* Card + reading side by side */}
      <View className="flex-row gap-[14px]">
        {/* Small flippable card */}
        <TouchableOpacity
          onPress={handleFlip}
          activeOpacity={flipped ? 1 : 0.85}
          style={{ width: CARD_W, height: CARD_H }}
        >
          {/* Back face */}
          <Animated.View
            style={{
              position: "absolute",
              width: CARD_W,
              height: CARD_H,
              opacity: frontOpacity,
              transform: [{ rotateY: frontRotate }],
              backfaceVisibility: "hidden",
              borderRadius: 8,
              backgroundColor: "#F5F2ED",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0.5,
              borderColor: "#2A2A2A",
            }}
          >
            <Text className="text-[20px] text-[#333333]">✦</Text>
          </Animated.View>

          {/* Front face */}
          <Animated.View
            style={{
              position: "absolute",
              width: CARD_W,
              height: CARD_H,
              opacity: backOpacity,
              transform: [{ rotateY: backRotate }],
              backfaceVisibility: "hidden",
              borderRadius: 8,
              backgroundColor: "#F5F2ED",
              alignItems: "center",
              justifyContent: "space-evenly",
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderWidth: 0.5,
              borderColor: "#2A2A2A",
            }}
          >
            <Text
              className="tracking-[1.5px] text-[#555555] text-center"
              style={{ fontSize: Typography.body.fontSize * 0.80 }}
            >
              TAROT
            </Text>

            <Text className="text-[26px] text-black">{card.symbol}</Text>

            {/* Colour dot */}
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: card.colourHex,
                borderWidth: 0.5,
                borderColor: "#333",
              }}
            />

            <Text
              className="tracking-[0.5px] text-black text-center"
              style={{ fontSize: Typography.body.fontSize * 0.80 }}
              numberOfLines={2}
            >
              {card.name}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Reading text — appears after flip */}
        <View className="flex-1 justify-center gap-[10px]">
          {flipped ? (
            <>
              {/* Archetype */}
              <View className="self-start border border-[#E6E6E6] px-2 py-1 rounded-[4px]">
                <Text
                  className="tracking-[2px] text-black"
                  style={{ fontSize: Typography.body.fontSize * 0.80 }}
                >
                  {card.archetype.toUpperCase()}
                </Text>
              </View>

              {/* Energy */}
              <Text
                className="text-black"
                style={{ fontSize: Typography.body.fontSize * 0.82, lineHeight: Typography.body.fontSize * 2 }}
              >
                {card.energy}
              </Text>

              {/* Colour row */}
              <View className="flex-row items-center gap-[6px]">
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: card.colourHex,
                    borderWidth: 0.5,
                    borderColor: "#E6E6E6",
                  }}
                />
                <Text
                  className="tracking-[1px] text-[#9A9A9A]"
                  style={{ fontSize: Typography.body.fontSize * 0.75 }}
                >
                  {card.colour}
                </Text>
              </View>
            </>
          ) : (
            // Placeholder before flip
            <View className="gap-[8px]">
              <View className="bg-[#F7F7F7] h-[10px] rounded-[4px] w-[80%]" />
              <View className="bg-[#F7F7F7] h-[10px] rounded-[4px] w-[60%]" />
              <View className="bg-[#F7F7F7] h-[10px] rounded-[4px] w-[70%]" />
            </View>
          )}
        </View>
      </View>

      {/* Full message — appears after flip */}
      {flipped && (
        <View className="bg-[#F7F7F7] px-3 py-3 mt-4 rounded-[4px]">
          <Text
            className="text-black"
            style={{ fontSize: Typography.body.fontSize * 0.90, lineHeight: Typography.body.fontSize * 1.6 }}
          >
            {card.message}
          </Text>
        </View>
      )}

      {/* Tomorrow*/}
      {flipped && (
        <Text
          className="mt-3 tracking-[1.5px] text-[#b13f3f] text-center"
          style={{ fontSize: Typography.body.fontSize * 0.68 }}
        >
          NEW CARD TOMORROW
        </Text>
      )}
    </View>
  );
}