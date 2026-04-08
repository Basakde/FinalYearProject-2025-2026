import DeleteButton from "@/components/deleteButton";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function CalendarScreen() {
  const { user } = useAuth();
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [month, setMonth] = useState(getYYYYMM(new Date()));
  const [monthMarks, setMonthMarks] = useState<MonthMark[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayLogs, setDayLogs] = useState<DayLog[]>([]);
  const [loadingDay, setLoadingDay] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  console.log("selectedDate:", selectedDate);

  const loadMonth = async (monthStr: string) => {
    setLoadingMonth(true);
    try {
      const res = await authFetch(
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
      const res = await authFetch(
        `${FASTAPI_URL}/logged_outfits/day?user_id=${user.id}&date_str=${dateStr}`
      );
      const data = await res.json();
      if (!res.ok) {
        console.log("day error:", data);
        setDayLogs([]);
        return;
      }
      console.log("Loaded day logs :", data);
      setDayLogs(data);
      setModalOpen(true);
    } catch (e) {
      console.log("day fetch failed:", e);
      setDayLogs([]);
    } finally {
      setLoadingDay(false);
    }
  };

  const deleteOOTDLog = async (wearLogId: string) => {
    try {
      const res = await authFetch(
        `${FASTAPI_URL}/logged_outfits/${wearLogId}?user_id=${user.id}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("Delete OOTD failed:", data);
        return;
      }

      setDayLogs((prev) => prev.filter((x) => x.wear_log_id !== wearLogId));

      await loadMonth(month);

      if (selectedDate) {
        await loadDay(selectedDate);
      }
    } catch (e) {
      console.log("Delete OOTD request failed:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMonth(month);

      return undefined;
    }, [month])
  );

  const markedSet = useMemo(() => {
    return new Set(monthMarks.map((m) => m.date));
  }, [monthMarks]);

  const renderItemThumbs = (items: DayLogItem[]) => {
    if (!items || items.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2.5"
      >
        {items.map((it) => (
          <View key={it.item_id} className="mr-5 w-16">
            {it.image_url ? (
              <Image
                source={{ uri: it.image_url }}
                className="w-16 h-24 rounded-lg bg-[#F7F7F7]"
              />
            ) : (
              <View className="w-16 h-24 rounded-lg bg-[#86ad6c]" />
            )}

            <Text
              className="mt-1 text-black opacity-75"
              numberOfLines={1}
              style={{ fontSize: Typography.body.fontSize * 0.72 }}
            >
              {it.name ?? it.category ?? ""}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 pt-10 bg-white">
       <View className="px-4 pb-2 mt-3 flex-row justify-between items-end">
          <View>
            <Text
              className="tracking-[2.5px] text-[#444444]"
              style={{ fontSize: Typography.body.fontSize * 0.95 }}
            >
             MY OUTFIT
            </Text>
            <Text
              className="tracking-[0.3px] text-black"
              style={{ fontSize: Typography.header.fontSize * 1.2 }}
            >
              CALENDAR
            </Text>
          </View>
          <ScreenHelpButton
            title="Calendar"
            subtitle="This is where logged outfits are organized by date."
            items={[
              "Tap a marked day to see what was worn on that date.",
              "Use the calendar to log a new outfit by selecting a day.",
              "Delete a logged outfit from the day details when needed.",
              "If you log an outfit from another screen, come back here to review it.",
            ]}
          />
        </View>

      <View className="h-[1px] bg-[#E6E6E6] " />

      <Modal visible={!!toastMsg} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/25">
          <View className="w-[240px] items-center rounded-[10px] bg-white px-6 py-5">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#0b6623]">
              <Text
                className="text-white"
                style={{ fontSize: Typography.section.fontSize * 1.1 }}
              >
                ✓
              </Text>
            </View>

            <Text
              className="text-center tracking-[0.8px] text-black"
              style={{ fontSize: Typography.body.fontSize * 0.92 }}
            >
              {toastMsg}
            </Text>
          </View>
        </View>
      </Modal>

      <View className="relative mx-4 mt-4 justify-center rounded-[8px] border border-[#E6E6E6] bg-white p-3">
        {loadingMonth && (
          <View className="absolute right-3 top-3 z-10">
            <ActivityIndicator size="small" color="#111111" />
          </View>
        )}

        <Calendar
          theme={{
            calendarBackground: "#f3eded",
            monthTextColor: "#1A1A1A",
            textMonthFontSize: 8 * scale,
            textMonthFontWeight: "100",
            textDayFontSize: Math.max(14, 14 * scale),
            textDayFontWeight: "500",
            textSectionTitleColor: "#8A8A8A",
            textSectionTitleDisabledColor: "#D1D5DB",
            selectedDayBackgroundColor: "#111111",
            arrowColor: "#111111",
            dayTextColor: "#111111",
            textDisabledColor: "#D1D5DB",
          }}
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
            const isToday = dateString === new Date().toISOString().slice(0, 10);

            return (
              <Pressable
                onPress={() => {
                  setSelectedDate(dateString);
                  loadDay(dateString);
                }}
                className={`w-10 items-center justify-center rounded-[10px] py-2 ${isSelected ? "bg-[#8A8A8A]" : "bg-transparent"} ${isToday && !isSelected ? "border border-[#D6D3C7]" : "border border-transparent"}`}
              >
                <Text
                  className={isDisabled ? "text-[#D1D5DB]" : isSelected ? "text-white" : "text-black"}
                  style={{
                    fontSize: Typography.body.fontSize * 0.92,
                    fontWeight: isSelected ? "700" : "400",
                  }}
                >
                  {date?.day}
                </Text>

                {hasLog && (
                  <Text
                    className="mt-1 text-black"
                    style={{ fontSize: Typography.body.fontSize }}
                  >
                    🧥
                  </Text>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      <View className="h-[1px] bg-[#E6E6E6] m-5" />

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable className="flex-1 bg-[rgba(0,0,0,0.35)]" onPress={() => setModalOpen(false)} />
        <View className="max-h-[70%] rounded-lg bg-white p-4">
            <Text
              className="uppercase tracking-[0.6px] text-[#111111]"
              style={{ fontSize: Typography.section.fontSize }}
            >
              {selectedDate ? `OOTD — ${selectedDate}` : "OOTD"}
            </Text>

            {loadingDay ? (
              <View className="py-5">
                <ActivityIndicator />
              </View>
            ) : (
              <FlatList
                className="mt-3"
                data={dayLogs}
                keyExtractor={(x) => x.wear_log_id}
                renderItem={({ item }) => {
                  const t = item.worn_at ? new Date(item.worn_at) : null;
                  const time = t
                    ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <View className="py-3 border-b border-[#eee]">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-3">
                          <Text
                            className="tracking-[1px] text-[#111111]"
                            style={{ fontSize: Typography.body.fontSize }}
                          >
                            {item.outfit_name ?? "Outfit"}
                          </Text>

                          <Text
                            className="mt-1 text-[#6B7280]"
                            style={{ fontSize: Typography.body.fontSize }}
                          >
                            {time}
                          </Text>
                        </View>

                        <DeleteButton
                          onPress={() =>
                            Alert.alert(
                              "Delete outfit log",
                              "Remove this outfit from the calendar?",
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Delete",
                                  style: "destructive",
                                  onPress: () => deleteOOTDLog(item.wear_log_id),
                                },
                              ]
                            )
                          }
                          variant="outline"
                          shape="pill"
                          size="sm"
                          label="Delete"
                          
                        />
                      </View>

                      {renderItemThumbs(item.items ?? [])}
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text
                    className="mt-3 text-[#111111]"
                    style={{ fontSize: Typography.body.fontSize }}
                  >
                    No outfits logged for this day.
                  </Text>
                }
              />
            )}

            <View className="mx-4 mt-4">
              <Pressable
                onPress={() => {
                  const dateToLog = selectedDate ?? "";
                  setModalOpen(false);
                  router.navigate({
                    pathname: "/(tabs)/pickOutfit",
                    params: {
                      date: dateToLog,
                    },
                  });
                }}
                className="items-center justify-center rounded border border-black bg-white px-4 py-3"
              >
                <Text
                  className="text-center tracking-[1.5px] text-black"
                  style={{ fontSize: Typography.body.fontSize * 0.8 }}
                >
                  {selectedDate ? `LOG OUTFIT FOR ${selectedDate}` : "LOG OUTFIT"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setModalOpen(false)}
              className="bg-black m-8 p-4 border rounded-lg"
            >
              <Text className="text-center text-white" style={{ fontSize: Typography.body.fontSize }}>
                Close
              </Text>
            </Pressable>
          </View>
      </Modal>
    </View>
  );
}