import BackButton from "@/components/backButton";
import FloatingButton from "@/components/floatingButton";
import SearchBar from "@/components/searchBar";
import { WardrobeItem } from "@/types/items";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";


export default function HomeScreen() {
  const { user } = useAuth();
  const FASTAPI_URL = "http://192.168.0.12:8000";

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([
    { id: -1, name: "All" }
  ]);
  const [selectedCat, setSelectedCat] = useState<number>(-1);



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

  const filteredItems =
    selectedCat === -1
      ? items
      : items.filter((i) => Number(i.category_id) === selectedCat);

  return (
    <SafeAreaView className="flex-1 bg-[#edede9]">
      {/* Gradient background */}
      <View className="absolute inset-0 bg-gradient-to-br from-[#FBF7F4] via-[#EED2CC] to-[#E8998D]" />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A1683A" />
          <Text className="text-[#6C9A8B] mt-3">Loading wardrobe...</Text>
        </View>
      ) : (
        <>
        <BackButton />
          {/* CATEGORIES */}
          <View className="px-1 py-5 mt-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCat(cat.id)}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    selectedCat === cat.id
                      ? "bg-[#E8998D] border-[#A1683A]"
                      : "bg-[#FBF7F4]/60 border-[#6C9A8B]/40"
                  }`}
                >
                  <Text
                    className={`${
                      selectedCat === cat.id ? "text-white" : "text-[#6C9A8B]"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SEARCH */}
          <View className="px-2">
            <SearchBar placeholder="Search items..."/>
          </View>

            {/* CARD CONTAINER */}
            <View className="flex-1 mt-3 mx-4 bg-[#edede9] border border-[#6C9A8B]/30 rounded-3xl p-3 backdrop-blur-lg shadow-xl">
              {/* GRID */}
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="w-[30%] mb-5"
                    onPress={() =>
                      router.push({
                        pathname: "/edit-wardrobe-item/[itemId]",
                        params: { itemId: item.id },
                      })
                    }
                  >
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-full aspect-square rounded-xl bg-[#ffffff] p-4"
                    />
                    <Text
                      className="text-xs mt-2 text-center"
                      numberOfLines={1}
                    >
                      {item.img_description || "No description"}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

          <FloatingButton />
        </>
      )}
    </SafeAreaView>
  );
}
