import { getCategories, WardrobeCategory } from "@/components/api/categoryApi";
import { deleteFavoriteOutfit, getFavoriteOutfits } from "@/components/api/favoriteApi";
import { getUserItems } from "@/components/api/itemApi";
import {
  createSubcategory as createWardrobeSubcategory,
  getSubcategories,
} from "@/components/api/subcategoryApi";
import BackButton from "@/components/backButton";
import { FavoriteOutfitViewerCard } from "@/components/favoriteOutfitViewerCard";
import FloatingButton from "@/components/floatingButton";
import UploadGuidelinesModal from "@/components/imageUploadGuidelineModal";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { useImages } from "@/context/ImageContext";
import { WardrobeItem } from "@/types/items";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, logout } = useAuth();
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
    console.log("Gallery permission:", permission);

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload images."
      );
      return;
    }

    console.log("About to launch native gallery picker...");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    console.log("Gallery picker result:", result);

    if (result.canceled) return;

    if (result.assets?.length) {
      for (const asset of result.assets) {
        await addImages(asset.uri);
      }

      router.replace("/image-gallery-view");
    }
  } catch (err) {
    console.log("Gallery picker failed:", err);
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
  console.log("Selected action:", action);
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
    <SafeAreaView className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A1683A" />
          <Text style={[Typography.body, { color: "#6C9A8B", marginTop: 12 }]}>
            Loading wardrobe...
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row justify-between">
            <BackButton />
            <Pressable className="mx-3" onPress={logout}>
              <MaterialIcons name="logout" size={24} color="black" />
            </Pressable>
          </View>

          <View className="px-4 mt-3 pb-2 flex-row justify-between items-center">
            <View>
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
                MY
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
                Wardrobe
              </Text>
            </View>

            <View className="flex-row items-center space-x-4">
              
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
                  "Open the calendar or image gallery with the icons on the right.",
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
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.80,
                      letterSpacing: 2,
                      color: activeTab === "wardrobe" ? "#fff" : "#000",
                    },
                  ]}
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
                  style={[
                    Typography.body,
                    {
                      fontSize: Typography.body.fontSize * 0.80,
                      letterSpacing: 2,
                      color: activeTab === "favorites" ? "#fff" : "#000",
                    },
                  ]}
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
                <Text style={[Typography.body, { color: "#111", marginTop: 12, opacity: 0.6 }]}>
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
                        <Text style={[Typography.section, { fontSize: Typography.section.fontSize * 1.2 }]}>
                          ‹
                        </Text>
                      </TouchableOpacity>

                      <Text
                        style={[
                          Typography.body,
                          {
                            marginHorizontal: 24,
                            fontSize: Typography.body.fontSize * 0.85,
                            letterSpacing: 2,
                            color: "#6E6E6E",
                          },
                        ]}
                      >
                        {favIndex + 1} / {favoriteOutfits.length}
                      </Text>

                      <TouchableOpacity
                        onPress={nextFav}
                        className="w-12 h-12 rounded-full bg-[#E6E6E6] items-center justify-center"
                      >
                        <Text style={[Typography.section, { fontSize: Typography.section.fontSize * 1.2 }]}>
                          ›
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View className="mt-20 items-center">
                    <Text
                      style={[
                        Typography.body,
                        {
                          fontSize: Typography.body.fontSize * 0.85,
                          letterSpacing: 2,
                          color: "#111",
                          opacity: 0.6,
                        },
                      ]}
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
                        style={[
                          Typography.body,
                          {
                            fontSize: Typography.body.fontSize * 0.72,
                            letterSpacing: 2,
                            color: selectedCat === cat.id ? "#fff" : "#000",
                          },
                        ]}
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
                  <Text style={[Typography.body, { color: "#111", marginRight: 8 }]}>⌕</Text>
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search by description"
                    placeholderTextColor="#9A9A9A"
                    style={[
                      Typography.body,
                      {
                        flex: 1,
                        color: "#111",
                      },
                    ]}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")} className="px-2 py-1">
                      <Text
                        style={[
                          Typography.body,
                          {
                            fontSize: Typography.body.fontSize * 1.2,
                            color: "#111",
                          },
                        ]}
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
                            style={[
                              Typography.body,
                              {
                                fontSize: Typography.body.fontSize * 0.9,
                                letterSpacing: 0.5,
                                color: active ? "#fff" : "#000",
                              },
                            ]}
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
                        style={[
                          Typography.body,
                          {
                            fontSize: Typography.body.fontSize * 1.1,
                            color: "#000",
                            lineHeight: Typography.body.fontSize * 1.1,
                          },
                        ]}
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
                        style={[
                          Typography.body,
                          {
                            fontSize: Typography.body.fontSize * 0.82,
                            color: "#000",
                            marginTop: 4,
                          },
                        ]}
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
              style={[
                Typography.body,
                {
                  fontSize: Typography.body.fontSize * 0.72,
                  letterSpacing: 1.5,
                  color: "#6E6E6E",
                  marginTop: 4,
                },
              ]}
            >
              {totalLabel}: {totalCount}
            </Text>
          </View>

          <Modal visible={addSubModal} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/40 px-6">
              <View className="w-full bg-white rounded-2xl p-5">
                <Text style={[Typography.section, { color: "#000" }]}>Add Subcategory</Text>
                <Text style={[Typography.body, { color: "#6B7280", marginTop: 4 }]}>
                  This will be added under the selected category.
                </Text>

                <TextInput
                  value={newSubName}
                  onChangeText={setNewSubName}
                  placeholder="e.g. Boots"
                  placeholderTextColor="#9A9A9A"
                  style={[
                    Typography.body,
                    {
                      borderWidth: 1,
                      borderColor: "#E6E6E6",
                      backgroundColor: "#fff",
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      marginTop: 16,
                    },
                  ]}
                />

                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={() => {
                      setAddSubModal(false);
                      setNewSubName("");
                    }}
                    className="px-4 py-3 mr-2"
                  >
                    <Text style={[Typography.body, { color: "#000", fontWeight: "600" }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={createSubcategory} className="px-4 py-3 bg-black">
                    <Text style={[Typography.body, { color: "#fff", fontWeight: "600" }]}>
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