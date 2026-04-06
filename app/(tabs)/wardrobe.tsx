import { getCategories, WardrobeCategory } from "@/components/api/categoryApi";
import { deleteFavoriteOutfit, getFavoriteOutfits } from "@/components/api/favoriteApi";
import { getUserItems } from "@/components/api/itemApi";
import {
  createSubcategory as createWardrobeSubcategory,
  getSubcategories,
} from "@/components/api/subcategoryApi";
import { FavoriteOutfitViewerCard } from "@/components/favoriteOutfitViewerCard";
import FloatingButton from "@/components/floatingButton";
import UploadGuidelinesModal from "@/components/imageUploadGuidelineModal";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { useImages } from "@/context/ImageContext";
import { WardrobeItem } from "@/types/items";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { scale } = useFontScale();
  const Typography = createTypography(scale);

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<WardrobeCategory[]>([
    { id: -1, name: "All" },
  ]);
  const [selectedCat, setSelectedCat] = useState<number>(-1);
  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubcat, setSelectedSubcat] = useState<number>(-1);
  const [addSubModal, setAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [favoriteOutfits, setFavoriteOutfits] = useState<any[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "favorites">("wardrobe");

  useEffect(() => {
    if (tab === "favorites") setActiveTab("favorites");
  }, [tab]);
  const [favIndex, setFavIndex] = useState(0);
  const currentFav = favoriteOutfits[favIndex] ?? null;
  const { width } = useWindowDimensions();
  const [guidelineOpen, setGuidelineOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"camera" | "gallery" | "web" | null>(null);
  const { addImages } = useImages();

  const COLS = 4;
  const GAP = 6;
  const H_PAD = 8;
  const tileW = (width - H_PAD * 2 - GAP * (COLS - 1)) / COLS;
  const tileH = tileW * (3 / 2);

  const handleGalleryPick = async () => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });


    if (result.canceled) return;

    if (result.assets?.length) {
      for (const asset of result.assets) {
        await addImages(asset.uri);
      }

      router.push("/image-gallery-view");
    }
  } catch (err) {
  
    Alert.alert("Error", "Could not open the gallery.");
  }
};

  const fetchFavoriteOutfits = async () => {
    try {
      setLoadingFav(true);

      const outfits = await getFavoriteOutfits(user.id);
      setFavoriteOutfits(outfits);
    } catch (err) {
      console.log("Favorites fetch failed:", err);
      setFavoriteOutfits([]);
    } finally {
      setLoadingFav(false);
    }
  };

  useEffect(() => {
    setFavIndex(0);
  }, [favoriteOutfits]);

  const nextFav = () => {
    if (favoriteOutfits.length === 0) return;
    setFavIndex((prev) => (prev + 1) % favoriteOutfits.length);
  };

  const prevFav = () => {
    if (favoriteOutfits.length === 0) return;
    setFavIndex((prev) => (prev - 1 + favoriteOutfits.length) % favoriteOutfits.length);
  };

  const unfavoriteOutfit = async (outfitId: string) => {
    try {
      await deleteFavoriteOutfit(user.id, outfitId);

      setFavoriteOutfits((prev) => prev.filter((o) => o.outfit_id !== outfitId));

      setFavIndex((prev) => {
        const newLength = favoriteOutfits.length - 1;
        if (newLength <= 0) return 0;
        return Math.min(prev, newLength - 1);
      });
    } catch (err) {
      console.log("Unfavorite request failed:", err);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const subs = await getSubcategories(user.id, categoryId);

      setSubcategories([{ id: -1, name: "All" }, ...subs.map((sub) => ({ id: sub.id, name: sub.name }))]);
    } catch (err) {
      console.log("Error fetching subcategories:", err);
      setSubcategories([{ id: -1, name: "All" }]);
    }
  };

  const createSubcategory = async () => {
    const name = newSubName.trim();
    if (!name || selectedCat === -1) return;

    try {
      const data = await createWardrobeSubcategory(user.id, selectedCat, name);

      setAddSubModal(false);
      setNewSubName("");

      await fetchSubcategories(selectedCat);

      if (data && typeof data === 'object' && 'subcategory' in data && (data as any).subcategory?.id) {
        setSelectedSubcat(Number((data as any).subcategory.id));
      }
    } catch (err) {
      console.log("Error creating subcategory:", err);
    }
  };

 const handleUploadAction = (action: "camera" | "gallery" | "web") => {
  setPendingAction(action);
  setGuidelineOpen(true);
};

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getUserItems(user.id);
      setItems(data || []);
    } catch (err) {
      console.log("Error fetching wardrobe:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories([{ id: -1, name: "All" }, ...data]);
    } catch (err) {
      console.log("Error fetching categories:", err);
    }
  };

  useFocusEffect(
      useCallback(() => {
        fetchCategories();

        if (activeTab === "favorites") {
          fetchFavoriteOutfits();
        } else {
          fetchItems();

          if (selectedCat !== -1) {
            fetchSubcategories(selectedCat);
          } else {
            setSubcategories([]);
          }
        }
      }, [user.id, activeTab, selectedCat])
    );

  useEffect(() => {
    setSelectedSubcat(-1);

    if (selectedCat === -1) {
      setSubcategories([]);
      return;
    }

    fetchSubcategories(selectedCat);
  }, [selectedCat]);

  const q = searchText.trim().toLowerCase();

  const filteredItems = items.filter((i) => {
    const catOk = selectedCat === -1 || Number(i.category_id) === selectedCat;

    const subOk = selectedSubcat === -1 || Number(i.subcategory_id ?? -999) === selectedSubcat;

    const desc = (i.img_description ?? "").toLowerCase();
    const searchOk = q === "" || desc.includes(q);

    return catOk && subOk && searchOk;
  });

  const totalLabel =
    activeTab === "favorites" ? "Total favorite outfits" : "Total items in wardrobe";
  const totalCount = activeTab === "favorites" ? favoriteOutfits.length : items.length;

  return (
    <SafeAreaView className="flex-1 bg-white" >
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A1683A" />
          <Text className="mt-3 text-[#6C9A8B]" style={{ fontSize: Typography.body.fontSize }}>
            Loading wardrobe...
          </Text>
        </View>
      ) : (
        <>
          <View className="px-4 pb-2 mt-3 flex-row justify-between items-center">
            <View>
              <Text
                className="tracking-[2.5px] text-[#444444]"
                style={{ fontSize: Typography.body.fontSize * 0.95 }}
              >
                MY
              </Text>
              <Text
                className="tracking-[0.3px] text-black"
                style={{ fontSize: Typography.header.fontSize * 1.2 }}
              >
                WARDROBE
              </Text>
            </View>

            <View className="flex-row items-center space-x-4">
              <TouchableOpacity onPress={() => router.push("/unworn-items-view")}>
                <Ionicons name="time-outline" size={22} color="black" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push("/image-gallery-view")}>
                <Ionicons name="grid-outline" size={22} color="black" />
              </TouchableOpacity>

              <ScreenHelpButton
                title="Wardrobe"
                subtitle="Manage clothing items and saved outfit ideas from one place."
                items={[
                  "Switch between WARDROBE and FAVORITE OUTFITS using the tabs.",
                  "Use category, subcategory, and search filters to narrow items.",
                  "Tap an item card to edit it, or use the floating add button to upload more.",
                  "Click clock icon to view unworn items or image gallery with the icon on the right.",
                ]}
              />
            </View>
          </View>

          <View className="h-[1px] bg-[#E6E6E6]" />

          <View className="px-4 mt-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setActiveTab("wardrobe")}
                className={`px-3 py-2 mr-2 border ${
                  activeTab === "wardrobe" ? "bg-black border-black" : "bg-white border-[#E6E6E6]"
                }`}
                style={{ borderRadius: 4 }}
              >
                <Text
                  className={activeTab === "wardrobe" ? "tracking-[2px] text-white" : "tracking-[2px] text-black"}
                  style={{ fontSize: Typography.body.fontSize * 0.9 }}
                >
                  WARDROBE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("favorites")}
                className={`px-3 py-2 mr-2 border ${
                  activeTab === "favorites" ? "bg-black border-black" : "bg-white border-[#E6E6E6]"
                }`}
                style={{ borderRadius: 4 }}
              >
                <Text
                  className={activeTab === "favorites" ? "tracking-[2px] text-white" : "tracking-[2px] text-black"}
                  style={{ fontSize: Typography.body.fontSize * 0.9 }}
                >
                  FAVORITE OUTFITS
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {activeTab === "favorites" ? (
            loadingFav ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="black" />
                <Text className="mt-3 text-[#111111] opacity-60" style={{ fontSize: Typography.body.fontSize }}>
                  Loading favorites...
                </Text>
              </View>
            ) : (
              <ScrollView
                className="flex-1 px-2 pt-2"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
              >
                {currentFav ? (
                  <>
                    <FavoriteOutfitViewerCard
                      outfit={currentFav}
                      cardH={400}
                      onDelete={() => unfavoriteOutfit(currentFav.outfit_id)}
                    />
                    <View className="flex-row justify-center items-center mt-4">
                      <TouchableOpacity
                        onPress={prevFav}
                        className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center"
                      >
                        <Text className="uppercase tracking-[0.6px] text-black" style={{ fontSize: Typography.section.fontSize * 1.2 }}>
                          ‹
                        </Text>
                      </TouchableOpacity>

                      <Text
                        className="mx-6 tracking-[2px] text-[#6E6E6E]"
                        style={{ fontSize: Typography.body.fontSize * 0.85 }}
                      >
                        {favIndex + 1} / {favoriteOutfits.length}
                      </Text>

                      <TouchableOpacity
                        onPress={nextFav}
                        className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center"
                      >
                        <Text className="uppercase tracking-[0.6px] text-black" style={{ fontSize: Typography.section.fontSize * 1.2 }}>
                          ›
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View className="mt-20 items-center">
                    <Text
                      className="tracking-[2px] text-[#111111] opacity-60"
                      style={{ fontSize: Typography.body.fontSize * 0.85 }}
                    >
                      NO FAVORITE OUTFITS YET
                    </Text>
                  </View>
                )}
              </ScrollView>
            )
          ) : (
            <>
              {/* CATEGORIES */}
              <View className="px-1 py-3 mt-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCat(cat.id)}
                      className={`px-3 py-2 mr-2 border ${
                        selectedCat === cat.id ? "bg-black border-black" : "bg-white border-[#E6E6E6]"
                      }`}
                      style={{ borderRadius: 4 }}
                    >
                      <Text
                        className={selectedCat === cat.id ? "tracking-[2px] text-white" : "tracking-[2px] text-black"}
                        style={{ fontSize: Typography.body.fontSize * 0.72 }}
                      >
                        {cat.name.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* SEARCH */}
              <View className="px-4 mt-2">
                <View
                  className="flex-row items-center border border-[#E6E6E6] bg-white px-3"
                  style={{ borderRadius: 4, height: 40 }}
                >
                  <Text className="mr-2 text-[#111111]" style={{ fontSize: Typography.body.fontSize }}>⌕</Text>
                  <TextInput
                    className="text-[#111111]"
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search by description"
                    placeholderTextColor="#9A9A9A"
                    style={{
                      flex: 1,
                      fontSize: Typography.body.fontSize,
                    }}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")} className="px-2 py-1">
                      <Text
                        className="text-[#111111]"
                        style={{ fontSize: Typography.body.fontSize * 1.2 }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View className="h-[1px] bg-[#E6E6E6] m-3" />

              {/* SUBCATEGORIES */}
              {selectedCat !== -1 && (
                <View className="px-4 mt-3 my-3">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {subcategories.map((sub) => {
                      const active = selectedSubcat === sub.id;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          onPress={() => setSelectedSubcat(sub.id)}
                          className={`px-3 py-2 mr-2 border ${
                            active ? "bg-black border-black" : "bg-white border-[#E6E6E6]"
                          }`}
                          style={{ borderRadius: 4 }}
                        >
                          <Text
                            className={active ? "tracking-[0.5px] text-white" : "tracking-[0.5px] text-black"}
                            style={{ fontSize: Typography.body.fontSize * 0.9 }}
                          >
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    <TouchableOpacity
                      onPress={() => setAddSubModal(true)}
                      className="px-3 py-2 border border-[#E6E6E6] bg-white"
                      style={{ borderRadius: 4 }}
                    >
                      <Text
                        className="text-black"
                        style={{
                          fontSize: Typography.body.fontSize * 1.1,
                          lineHeight: Typography.body.fontSize * 1.1,
                        }}
                      >
                        ＋
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}

              {/* WARDROBE GRID */}
              <View className="flex-1 px-2 pt-2">
                <FlatList
                  data={filteredItems}
                  keyExtractor={(item) => item.id}
                  numColumns={COLS}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 90 }}
                  columnWrapperStyle={{ gap: GAP }}
                  ListEmptyComponent={
                    <View className="items-center mt-16 px-4">
                      <Text
                        className="tracking-[2px] text-[#111111] opacity-60"
                        style={{ fontSize: Typography.body.fontSize * 0.85 }}
                      >
                        NO ITEMS YET
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/edit-wardrobe-item/[itemId]",
                          params: { itemId: item.id },
                        })
                      }
                      style={{ width: tileW, marginBottom: 8 }}
                      className="overflow-hidden"
                    >
                      <View className="rounded-[4px] overflow-hidden bg-[#F7F7F7]">
                        <View style={{ height: tileH }} className="w-full">
                          <Image
                            source={{ uri: item.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                      </View>

                      <Text
                        className="mt-1 text-black"
                        style={{ fontSize: Typography.body.fontSize * 0.82 }}
                        numberOfLines={1}
                      >
                        {item.img_description || ""}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </>
          )}
        

          <View className="px-4">
            <Text
              className="mt-1 tracking-[1.5px] text-[#6E6E6E]"
              style={{ fontSize: Typography.body.fontSize * 0.85 }}
            >
              {totalLabel}: {totalCount}
            </Text>
          </View>

          <Modal visible={addSubModal} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/40 px-6">
              <View className="w-full bg-white rounded-2xl p-5">
                <Text className="uppercase tracking-[0.6px] text-black" style={{ fontSize: Typography.section.fontSize }}>Add Subcategory</Text>
                <Text className="mt-1 text-[#6B7280]" style={{ fontSize: Typography.body.fontSize }}>
                  This will be added under the selected category.
                </Text>

                <TextInput
                  className="mt-4 border border-[#E6E6E6] bg-white px-3 py-3 text-black"
                  value={newSubName}
                  onChangeText={setNewSubName}
                  placeholder="e.g. Boots"
                  placeholderTextColor="#9A9A9A"
                  style={{ fontSize: Typography.body.fontSize }}
                />

                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={() => {
                      setAddSubModal(false);
                      setNewSubName("");
                    }}
                    className="px-4 py-3 mr-2"
                  >
                    <Text className="font-semibold text-black" style={{ fontSize: Typography.body.fontSize }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={createSubcategory} className="px-4 py-3 bg-black">
                    <Text className="font-semibold text-white" style={{ fontSize: Typography.body.fontSize }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}  

        <FloatingButton onSelectAction={handleUploadAction} />

        <UploadGuidelinesModal
          visible={guidelineOpen}
          onClose={() => {
            setGuidelineOpen(false);
            setPendingAction(null);
          }}
          onAccept={async () => {
              const action = pendingAction;
              setGuidelineOpen(false);

              if (action === "camera") {
                setPendingAction(null);
                router.push("/camera-view");
                return;
              }

              if (action === "web") {
                setPendingAction(null);
                router.push("/web-browsing-view");
                return;
              }

              if (action === "gallery") {
                  setTimeout(() => {
                    handleGalleryPick();
                  }, 300);
                  return;
              }
            }}
          />
    </SafeAreaView>
  );
}