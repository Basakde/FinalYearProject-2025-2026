import BackButton from "@/components/backButton";
import DeleteButton from "@/components/deleteButton";
import UploadGuidelinesModal from "@/components/imageUploadGuidelineModal";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SavedSite = {
  id: string;
  name: string;
  url: string;
};

const getStorageKey = (userId: string | undefined) =>
  userId ? `saved_sites_${userId}` : "saved_sites_guest";

export default function SavedSitesView() {
    const router = useRouter();
    const { scale } = useFontScale();
    const Typography = createTypography(scale);
    const { user } = useAuth();

  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);
  const hasLoadedRef = useRef(false);

  const [sites, setSites] = useState<SavedSite[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [guidelineOpen, setGuidelineOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  /* LOAD — runs when user changes */
  useEffect(() => {
    hasLoadedRef.current = false;
    setSites([]);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) setSites(JSON.parse(raw));
      } catch (e) {
        console.log("Failed to load saved sites:", e);
      }
      hasLoadedRef.current = true;
    })();
  }, [storageKey]);

  /* SAVE — only after initial load for current user */
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(sites));
  }, [sites, storageKey]);

  const addSite = () => {
    if (!newName || !newUrl) return;

    const normalized =
      newUrl.startsWith("http://") || newUrl.startsWith("https://")
        ? newUrl
        : `https://${newUrl}`;

    setSites((prev) => [
      {
        id: String(Date.now()),
        name: newName.toUpperCase(),
        url: normalized,
      },
      ...prev,
    ]);

    setNewName("");
    setNewUrl("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="pt-2 px-4 pb-3 border-b border-[#E6E6E6]">
        <View className="flex-row justify-between items-center">
          <BackButton fallbackHref="/(tabs)/wardrobe" />
          <ScreenHelpButton
            title="Saved Sites"
            subtitle="Keep your most visited shopping and fashion websites here for quick access."
            items={[
              "Tap ADD SITE to save a new website with a name and URL.",
              "Tap a saved site to open it in the in-app browser.",
              "You can capture images from the browser .",
              "Delete sites you no longer need with the delete button.",
            ]}
          />
        </View>

        <View className="mt-3">
          <Text
            className="tracking-[2.5px] text-[#444444]"
            style={{ fontSize: Typography.body.fontSize * 0.95 }}
          >
            SAVED
          </Text>
          <Text
            className="tracking-[0.3px] text-black"
            style={{ fontSize: Typography.header.fontSize * 1.2 }}
          >
            SITES
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="mt-4 bg-black px-4 py-3 rounded"
        >
          <Text className="tracking-[1.5px] text-white text-center" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
            ADD SITE
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <Text className="text-center tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              NO SAVED SITES YET
            </Text>
            <Text className="mt-2 text-center text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              Tap "ADD SITE" to save your favorite shopping websites.
            </Text>
          </View>
        }
         renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
                setPendingUrl(item.url);
                setGuidelineOpen(true);
              }}
            className="border border-[#E6E6E6] bg-[#F7F7F7] px-4 py-4 mb-3"
            style={{ borderRadius: 8 }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <Text
                className="flex-1 tracking-[1.8px] text-black"
                style={{ fontSize: Typography.body.fontSize * 0.95 }}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <DeleteButton
                onPress={() => {
                  setSites((prev) => prev.filter((site) => site.id !== item.id));
                }}
                variant="outline"
                size="sm"
              />
            </View>

            <Text className="mt-2 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }} numberOfLines={1}>
              {item.url.replace(/^https?:\/\//, "")}
            </Text>
          </TouchableOpacity>
        )}
        />

        <UploadGuidelinesModal
            visible={guidelineOpen}
            onClose={() => {
              setGuidelineOpen(false);
              setPendingUrl(null);
            }}
            onAccept={() => {
              setGuidelineOpen(false);

              if (pendingUrl) {
                router.push({
                  pathname: "/web-browsing-view",
                  params: { url: pendingUrl },
                });
              }

              setPendingUrl(null);
            }}
          />

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="none">
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setModalVisible(false)}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : "height"}
          keyboardVerticalOffset={40}
          className="absolute left-0 right-0 bottom-0"
        >
          <View className="bg-white border-t border-[#E6E6E6] px-4 pt-4 pb-8">
            <Text className="tracking-[2px] text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
              ADD A NEW SITE
            </Text>

            <Text className="mt-4 tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              NAME
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="ZARA"
              className="border border-[#E6E6E6] px-3 py-3 mt-2"
              style={{ fontSize: Typography.body.fontSize }}
            />

            <Text className="mt-4 tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.85 }}>
              URL
            </Text>
            <TextInput
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="zara.com"
              keyboardType="url"
              className="border border-[#E6E6E6] px-3 py-3 mt-2"
              style={{ fontSize: Typography.body.fontSize }}
            />

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="border border-[#E6E6E6] px-4 py-3 rounded"
              >
                <Text className="tracking-[1px]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={addSite}
                className="bg-black px-6 py-3 rounded"
              >
                <Text className="tracking-[1.5px] text-white" style={{ fontSize: Typography.body.fontSize * 0.95 }}>ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
