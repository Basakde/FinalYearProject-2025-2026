import ClothingItem from "@/components/clothing-item";
import FloatingButton from "@/components/floating-button";
import SearchBar from "@/components/search-bar";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]); // store fetched clothing items
  const [loading, setLoading] = useState(true);

  const clothingIcons = [
    { name: "All", iconName: "all" },
    { name: "Tops", iconName: "tshirt" },
    { name: "Bottoms", iconName: "jeans" },
    { name: "Dresses", iconName: "sundress" },
    { name: "Skirts", iconName: "skirts" },
    { name: "Outerwear", iconName: "jacket" },
    { name: "Footwear", iconName: "sneakers" },
    { name: "Accessories", iconName: "sunglasses" },
  ];
  const userId=user.id;
 const fetchItems = async () => {
    try {
      setLoading(true);
      console.log("🔹 user.id being used:", userId);
      const response = await fetch(
        `http://192.168.0.12:8000/items/${userId}`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched items:", result);

      setItems(result.items || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Runs each time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [user.id])
  );


  // ✅ Show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>Loading wardrobe...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Category bar */}
      <View>
        <ScrollView horizontal>
          {clothingIcons.map((item, index) => (
            <View className="flex-row" key={item.name ?? index}>
              <ClothingItem name={item.name} iconName={item.iconName} />
            </View>
          ))}
        </ScrollView>

        <View className="mt-4">
          <SearchBar clearButtonMode="always" placeholder="Search by name" />
        </View>
      </View>

      {/* ✅ FlatList for fetched wardrobe items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View className="flex-1 justify-center items-center m-2">
            <Image
              source={{ uri: item.image_url }}
              className="w-32 h-32 rounded-lg"
              resizeMode="cover"
            />
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-5">
            No items found yet.
          </Text>
        }
      />

      <FloatingButton />
    </SafeAreaView>
  );
}
