import BackButton from "@/components/backButton";
import FloatingButton from "@/components/floatingButton";
import { FASTAPI_URL } from "@/IP_Config";
import { WardrobeItem } from "@/types/items";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";


export default function HomeScreen() {
  const { user } = useAuth();

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([
    { id: -1, name: "All" }
  ]);
  const [selectedCat, setSelectedCat] = useState<number>(-1);

  const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubcat, setSelectedSubcat] = useState<number>(-1); // -1 means All subcategories
  const [addSubModal, setAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [searchText, setSearchText] = useState("");

  const COLS = 4;
  const GAP = 6;   // gap between tiles (px)
  const H_PAD = 8; // px-2 = 8px each side


  const { width } = useWindowDimensions();

  // fixed tile width so last row doesn't stretch
  const tileW = (width - (H_PAD * 2) - (GAP * (COLS - 1))) / COLS;
  const tileH = tileW * (3 / 2); // portrait 2:3



  const fetchSubcategories = async (categoryId: number) => {
  try {
    const res = await fetch(
      `${FASTAPI_URL}/subcategories/?user_id=${user.id}&category_id=${categoryId}`
    );
    const data = await res.json();

    const subs = (data.subcategories ?? []).map((s: any) => ({
      id: Number(s.id),
      name: String(s.name),
    }));

    setSubcategories([{ id: -1, name: "All" }, ...subs]);
  } catch (err) {
    console.log("Error fetching subcategories:", err);
    setSubcategories([{ id: -1, name: "All" }]);
  }
};

const createSubcategory = async () => {
  const name = newSubName.trim();
  if (!name || selectedCat === -1) return;

  try {
    const res = await fetch(`${FASTAPI_URL}/subcategories/create_subcategory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        category_id: selectedCat,
        name,
      }),
    });


    const data = await res.json();

    if (!res.ok) {
      console.log("Create subcategory failed:", data);
      return;
    }

    setAddSubModal(false);
    setNewSubName("");

    // refresh subcategories list
    await fetchSubcategories(selectedCat);

    // optional: auto select created subcategory
    if (data?.subcategory?.id) {
      setSelectedSubcat(Number(data.subcategory.id));
    }
  } catch (err) {
    console.log("Error creating subcategory:", err);
  }
};



  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${FASTAPI_URL}/items/user/${user.id}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.log("Error fetching wardrobe:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${FASTAPI_URL}/categories/`);
      const data = await res.json();
      setCategories([{ id: -1, name: "All" }, ...data.categories]);
    } catch (err) {
      console.log("Error fetching categories:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      fetchCategories();
    }, [user.id])
  );

  useEffect(() => {
  // reset subcategory filter whenever category changes
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

      const subOk =
        selectedSubcat === -1 ||
        Number(i.subcategory_id ?? -999) === selectedSubcat;

      const desc = (i.img_description ?? "").toLowerCase();
      const searchOk = q === "" || desc.includes(q);

      return catOk && subOk && searchOk;
    });




  return (
    <SafeAreaView className="flex-1 bg-white">

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A1683A" />
          <Text className="text-[#6C9A8B] mt-3">Loading wardrobe...</Text>
        </View>
      ) : (
        <>
        <BackButton />
        <View className="px-4 pt-2 pb-2">
          <Text className="text-[16px] tracking-[2px] text-[#111]">MY WARDROBE</Text>
        </View>

          {/* CATEGORIES */}
          <View className="px-1 py-5 mt-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCat(cat.id)}
                  className={`px-3 py-2 mr-2 border ${
                      selectedCat === cat.id
                        ? "bg-black border-black"
                        : "bg-white border-[#E6E6E6]"
                    }`}
                    style={{ borderRadius: 4 }}

                >
                  <Text
                    className={`text-[12px] tracking-[2px] ${
                      selectedCat === cat.id ? "text-white" : "text-black"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SEARCH */}
          <View className="px-4 mt-2">
            <View className="flex-row items-center border border-[#E6E6E6] bg-white px-3"
                  style={{ borderRadius: 4, height: 40 }}>
              <Text className="text-[#111] mr-2">⌕</Text>

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search"
                placeholderTextColor="#9A9A9A"
                className="flex-1 text-[13px] text-[#111]"
              />

              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")} className="px-2 py-1">
                  <Text className="text-[#111] text-[16px]">×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

            {/* SUBCATEGORIES */}
              {selectedCat !== -1 && (
                <View className="px-4 mt-3">
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
                            className={`${active ? "text-white" : "text-black"} text-[12px] tracking-[0.5px]`}
                          >
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* + ADD button */}
                    <TouchableOpacity
                      onPress={() => setAddSubModal(true)}
                      className="px-3 py-2 border border-[#E6E6E6] bg-white"
                      style={{ borderRadius: 4 }}
                    >
                      <Text className="text-black text-[14px] leading-none">＋</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}


            {/* CARD CONTAINER */}
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
                        {/* portrait rectangle */}
                        <View style={{ height: tileH }} className="w-full">
                          <Image
                            source={{ uri: item.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                      </View>

                      <Text className="text-[11px] text-black mt-1" numberOfLines={1}>
                        {item.img_description || ""}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>



          <FloatingButton />
          <Modal visible={addSubModal} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/40 px-6">
              <View className="w-full bg-white rounded-2xl p-5">
                <Text className="text-lg font-bold text-black ">Add Subcategory</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  This will be added under the selected category.
                </Text>

                <TextInput
                  value={newSubName}
                  onChangeText={setNewSubName}
                  placeholder="e.g. Boots"
                  placeholderTextColor="#9A9A9A"
                  className="flex-row items-center border border-[#E6E6E6] bg-white px-3 py-3 mt-4"
                />

                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={() => {
                      setAddSubModal(false);
                      setNewSubName("");
                    }}
                    className="px-4 py-3 mr-2"
                  >
                    <Text className="text-black font-semibold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={createSubcategory}
                    className="px-4 py-3 bg-black"
                  >
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}
