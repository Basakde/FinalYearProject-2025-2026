import BackButton from "@/components/backButton";
import DeleteButton from "@/components/deleteButton";
import UploadGuidelinesModal from "@/components/imageUploadGuidelineModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const STORAGE_KEY = "saved_sites_urls";

export default function SavedSitesView() {
    const router = useRouter();

  const [sites, setSites] = useState<SavedSite[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [guidelineOpen, setGuidelineOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  /* LOAD */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setSites(JSON.parse(raw));
    })();
  }, []);

  /* SAVE */
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  }, [sites]);

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
        <BackButton />
        <Text className="mt-3 text-[12px] tracking-[2px] text-black">
          SAVED SITES
        </Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="mt-4 border border-black px-4 py-3"
          style={{ borderRadius: 2 }}
        >
          <Text className="text-[12px] tracking-[1.5px] text-black text-center">
            ADD SITE
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
         renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
                setPendingUrl(item.url);
                setGuidelineOpen(true);
              }}
            className="border border-[#E6E6E6] px-4 py-4 mb-3"
            style={{ borderRadius: 4 }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <Text
                className="flex-1 text-[12px] tracking-[1.8px] text-black"
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

            <Text className="mt-2 text-[12px] text-[#6E6E6E]" numberOfLines={1}>
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
            <Text className="text-[12px] tracking-[2px] text-black">
              ADD A NEW SITE
            </Text>

            <Text className="mt-4 text-[11px] tracking-[1.8px] text-[#6E6E6E]">
              NAME
            </Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="ZARA"
              className="border border-[#E6E6E6] px-3 py-3 mt-2"
            />

            <Text className="mt-4 text-[11px] tracking-[1.8px] text-[#6E6E6E]">
              URL
            </Text>
            <TextInput
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="zara.com"
              keyboardType="url"
              className="border border-[#E6E6E6] px-3 py-3 mt-2"
            />

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="border border-[#E6E6E6] px-4 py-3"
                style={{ borderRadius: 4 }}
              >
                <Text className="text-[12px] tracking-[1px]">CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={addSite}
                className="border border-black px-6 py-3"
                style={{ borderRadius: 4 }}
              >
                <Text className="text-[12px] tracking-[1.5px]">ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
