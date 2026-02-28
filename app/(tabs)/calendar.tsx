import BackButton from "@/components/backButton";
import { useAuth } from "@/context/AuthContext";
import { FASTAPI_URL } from "@/IP_Config";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";

type MonthMark = { date: string; count: number };

type DayLogItem = {
  item_id: string;
  name?: string | null;
  image_url?: string | null;
  category?: string | null;
  position?: number | null;

};

type DayLog = {
  wear_log_id: string;
  worn_at: string;
  outfit_id: string;
  outfit_name?: string | null;
  items: DayLogItem[];
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getYYYYMM(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export default function OOTDCalendarScreen() {
  const { user } = useAuth();

  const [month, setMonth] = useState(getYYYYMM(new Date()));
  const [monthMarks, setMonthMarks] = useState<MonthMark[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayLogs, setDayLogs] = useState<DayLog[]>([]);
  const [loadingDay, setLoadingDay] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadMonth = async (monthStr: string) => {
    setLoadingMonth(true);
    try {
      const res = await fetch(
        `${FASTAPI_URL}/logged_outfits/month?user_id=${user.id}&month=${monthStr}`
      );
      const data = await res.json();
      if (!res.ok) {
        console.log("month error:", data);
        setMonthMarks([]);
        return;
      }
      setMonthMarks(data);
    } catch (e) {
      console.log("month fetch failed:", e);
      setMonthMarks([]);
    } finally {
      setLoadingMonth(false);
    }
  };

  const loadDay = async (dateStr: string) => {
    setLoadingDay(true);
    try {
      const res = await fetch(
        `${FASTAPI_URL}/logged_outfits/day?user_id=${user.id}&date_str=${dateStr}`
      );
      const data = await res.json();
      if (!res.ok) {
        console.log("day error:", data);
        setDayLogs([]);
        return;
      }
      // Expecting: [{ wear_log_id, worn_at, outfit_id, outfit_name, items: [...] }, ...]
      setDayLogs(data);
      setModalOpen(true);
    } catch (e) {
      console.log("day fetch failed:", e);
      setDayLogs([]);
    } finally {
      setLoadingDay(false);
    }
  };

  useEffect(() => {
    loadMonth(month);
  }, [month]);

  const markedSet = useMemo(() => {
  return new Set(monthMarks.map((m) => m.date));
}, [monthMarks]);

  const renderItemThumbs = (items: DayLogItem[]) => {
    if (!items || items.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10 }}
      >
        {items.map((it) => (
          <View key={it.item_id} className="mr-5 w-16">
            {it.image_url ? (
              <Image
                source={{ uri: it.image_url }}
                className="w-16 h-24 rounded-lg bg-[#F7F7F7]"
              />
            ) : (
              <View
                className="w-16 h-24 rounded-lg bg-[#86ad6c]"
              />
            )}

            <Text
              numberOfLines={1}
              className="text-[10px] mt-1 opacity-75"

            >
              {it.name ?? it.category ?? ""}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 pt-10 mt-5 px-4">
      <BackButton />
      <View className="px-4 pt-2 pb-2 flex-row justify-between mt-2">
        <Text className="text-[16px] tracking-[2px] text-[#111]">OUTFIT CALENDAR</Text>
      </View>
      <View className="h-[1px] bg-[#E6E6E6] " />

      {loadingMonth && (
        <View className="py-2">
          <ActivityIndicator />
        </View>
      )}

      <Calendar
        onDayPress={(day) => {
            setSelectedDate(day.dateString);
            loadDay(day.dateString);
        }}
        onMonthChange={(m) => {
            const newMonth = `${m.year}-${pad2(m.month)}`;
            setMonth(newMonth);
        }}
        dayComponent={({ date, state }) => {
            const dateString = date?.dateString ?? "";
            const isSelected = selectedDate === dateString;
            const hasLog = markedSet.has(dateString);
            const isDisabled = state === "disabled";

            return (
            <Pressable
                onPress={() => {
                setSelectedDate(dateString);
                loadDay(dateString);
                }}
                className="items-center justify-center p-1"
            >
                <Text
                className={`text-[14px] ${isSelected ? "font-bold" : "font-normal"} ${isDisabled ? "text-gray-300" : "text-black"}`}
                >
                {date?.day} 
                </Text>

                {hasLog && (
                <Text className="text-[10px] mt-1">
                    👕
                </Text>
                )}
            </Pressable>
            );
            }}
        />

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View
          className="flex-1 justify-end bg-[rgba(0,0,0,0.35)]"
        >
          <View
            className="bg-white p-4 rounded-tl-lg rounded-tr-lg max-h-[70%]"
          >
            <Text className="text-[16px] ">
              {selectedDate ? `OOTD — ${selectedDate}` : "OOTD"}
            </Text>
         
            {loadingDay ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator />
              </View>
            ) : (
              <FlatList
                style={{ marginTop: 12 }}
                data={dayLogs}
                keyExtractor={(x) => x.wear_log_id}
                renderItem={({ item }) => {
                  const t = item.worn_at ? new Date(item.worn_at) : null;
                  const time = t
                    ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <View
                      className="py-3 border-b border-[#eee]"
                    >
                      <Text className="text-[14px] tracking-[1px] text-[#111]">
                        {item.outfit_name ?? "Outfit"}
                      </Text>
                      <Text className="text-gray-500 mt-1">{time}</Text>

                      {/* Items thumbnails */}
                      {renderItemThumbs(item.items ?? [])}
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text className="mt-3">
                    No outfits logged for this day.
                  </Text>
                }
              />
            )}

            <Pressable
              onPress={() => setModalOpen(false)}
              className="mt-12 p-4 border rounded-lg"
            >
              <Text className="text-center">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}