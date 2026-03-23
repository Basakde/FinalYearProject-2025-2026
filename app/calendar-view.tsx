import BackButton from "@/components/backButton";
import DeleteButton from "@/components/deleteButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/supabaseConfig";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

export default function OOTDCalendarScreen() {
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

  const { logged, date } = useLocalSearchParams<{
    logged?: string;
    date?: string;
  }>();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  useEffect(() => {
    if (logged === "true" && date) {
      setSelectedDate(date);
      setToastMsg(`New outfit logged for ${date}`);

      const timer = setTimeout(() => {
        setToastMsg(null);
        setSelectedDate(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [logged, date]);

  useFocusEffect(
    useCallback(() => {
      loadMonth(month);
      setModalOpen(false);
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
              <View className="w-16 h-24 rounded-lg bg-[#86ad6c]" />
            )}

            <Text
              numberOfLines={1}
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.72,
                  marginTop: 4,
                  opacity: 0.75,
                },
              ]}
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
      <BackButton />

       <View className="px-4 pt-2 pb-2">
                  
          <Text
            style={[
              Typography.body,
              {
                fontSize: Typography.body.fontSize * 0.95,
                letterSpacing: 2.5,
                color: "#444",
              },
            ]}
          >
           MY OUTFIT
          </Text>
          <Text
            style={[
              Typography.header,
              {
                fontSize: Typography.header.fontSize * 1.2,
                letterSpacing: 0.3,
                color: "#000",
              },
            ]}
          >
            CALENDAR
          </Text>
        </View>

      <View className="h-[1px] bg-[#E6E6E6] " />

      {loadingMonth && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      )}

      <Modal visible={!!toastMsg} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/25">
          <View
            className="bg-white px-6 py-5 items-center"
            style={{ borderRadius: 10, width: 240 }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: "#0b6623" }}
            >
              <Text
                style={[
                  Typography.section,
                  {
                    color: "#fff",
                    fontSize: Typography.section.fontSize * 1.1,
                  },
                ]}
              >
                ✓
              </Text>
            </View>

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
              {toastMsg}
            </Text>
          </View>
        </View>
      </Modal>

      <View className="mx-4 mt-4 bg-white border-[#E6E6E6] rounded-[8px] p-3 justify-center">
        <Calendar
          theme={{
            monthTextColor: "#242222",
            textMonthFontSize: 8 * scale,
            textMonthFontWeight: "bold",
            textDayFontSize: 5 * scale,
            textDayFontWeight: "400",
            selectedDayBackgroundColor: "#111111",
            arrowColor: "#111111",
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

            return (
              <Pressable
                onPress={() => {
                  setSelectedDate(dateString);
                  loadDay(dateString);
                }}
                className="items-center justify-center w-9 py-3 rounded-[6px]"
              >
                <Text
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize,
                      fontWeight: isSelected ? "700" : "400",
                      color: isDisabled ? "#D1D5DB" : "#000",
                    },
                  ]}
                >
                  {date?.day}
                </Text>

                {hasLog && (
                  <Text
                    style={[
                      Typography.body,
                      {
                        fontSize: Typography.body.fontSize,
                        marginTop: 4,
                      },
                    ]}
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
        <View className="flex-1 justify-end bg-[rgba(0,0,0,0.35)]">
          <View className="bg-white p-4 rounded-tl-lg rounded-tr-lg max-h-[70%]">
            <Text
              style={[
                Typography.section,
                {
                  color: "#111",
                },
              ]}
            >
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
                    <View className="py-3 border-b border-[#eee]">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-3">
                          <Text
                            style={[
                              Typography.body,
                              {
                                fontSize: Typography.body.fontSize,
                                letterSpacing: 1,
                                color: "#111",
                              },
                            ]}
                          >
                            {item.outfit_name ?? "Outfit"}
                          </Text>

                          <Text
                            style={[
                              Typography.body,
                              {
                                color: "#6B7280",
                                marginTop: 4,
                              },
                            ]}
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
                    style={[
                      Typography.body,
                      {
                        marginTop: 12,
                        color: "#111",
                      },
                    ]}
                  >
                    No outfits logged for this day.
                  </Text>
                }
              />
            )}

            <View className="mx-4 mt-4">
              <Pressable
                onPress={() => {
                  setModalOpen(false);
                  router.replace({
                    pathname: "/(tabs)/pickOutfit",
                    params: {
                      date: selectedDate ?? "",
                    },
                  });
                }}
                className="border border-black bg-white px-4 py-3 items-center justify-center"
                style={{ borderRadius: 4 }}
              >
                <Text
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.8,
                      letterSpacing: 1.5,
                      color: "#000",
                      textAlign: "center",
                    },
                  ]}
                >
                  {selectedDate ? `LOG OUTFIT FOR ${selectedDate}` : "LOG OUTFIT"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setModalOpen(false)}
              className="bg-black m-8 p-4 border rounded-lg"
            >
              <Text
                style={[
                  Typography.body,
                  {
                    color: "#fff",
                    textAlign: "center",
                  },
                ]}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}