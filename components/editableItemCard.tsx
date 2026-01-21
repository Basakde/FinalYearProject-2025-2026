import { TagInput } from "@/components/tagInput";
import { useAuth } from "@/context/AuthContext";
import { Category, EditableItem, Subcategory } from "@/types/items";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createItem, updateItem } from "./api/itemApi";
import { SEASONS } from "./lists";
import { MultiSelectValues } from "./multiSelectValues";
import { SingleSelectChips } from "./singleSelectValues";


export default function ImageEditCard({ item }: { item: any }) {
  const FASTAPI_URL = "http://192.168.0.12:8000";
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // FORM STATE

  const [localItem, setLocalItem] = useState<EditableItem>({
    id: item.id ?? null,
    imageUri: item.imageUri,
    processedUri: item.processedUri,
    imgDescription: item.imgDescription ?? "",
    categoryId: item.categoryId ?? null,
    subcategoryId: item.subcategoryId ?? null, 
    colors: item.colors ?? [],
    materials: item.materials ?? [],
    occasion: item.occasion ?? [],
    season: item.season ?? [],
  });

  console.log("localItem", localItem);

  const handleChange = (field: keyof EditableItem, value: any) => {
    setLocalItem((prev) => ({ ...prev, [field]: value }));
  };

  const fetchSubcategories = async (categoryId: number) => {
  try {
    const res = await fetch(
      `${FASTAPI_URL}/subcategories/?user_id=${user.id}&category_id=${categoryId}`
    );
    const data = await res.json();
    setSubcategories(data.subcategories ?? []);
  } catch (e) {
    console.log("Failed to fetch subcategories", e);
    setSubcategories([]);
  }
};

const [prevCategoryId, setPrevCategoryId] = useState<number | null>(null);

useEffect(() => {
  const currentCategoryId = localItem.categoryId ?? null;

  if (!currentCategoryId) {
    setSubcategories([]);
    handleChange("subcategoryId", null);
    setPrevCategoryId(null);
    return;
  }

  // Always fetch subcategories for the selected category
  fetchSubcategories(currentCategoryId);

  // Only reset subcategory if the user ACTUALLY changed category
  if (prevCategoryId !== null && prevCategoryId !== currentCategoryId) {
    handleChange("subcategoryId", null);
  }

  setPrevCategoryId(currentCategoryId);
}, [localItem.categoryId]);

 
  // FETCH CATEGORIES
 
  useEffect(() => {
    fetch(`${FASTAPI_URL}/categories/`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch(console.error);
  }, []);


 
  // DELETE ITEM
  
  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${FASTAPI_URL}/items/${localItem.id}`, {
            method: "DELETE",
          });
         router.back();
        },
      },
    ]);
  };


  // SAVE ITEM
 
  const handleSave = async () => {
    try {
      if (localItem.id) {
        await updateItem(localItem.id, localItem, user.id);
      } else {
        await createItem(user.id, localItem);
      }

      Alert.alert("Saved", "Item updated successfully!");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save item.");
    }
  };

  return (
     <ScrollView className={`p-3 rounded-xl`}>
        <KeyboardAwareScrollView>
            
        {/* DELETE BUTTON */}
        {localItem.id !== null && (
          <TouchableOpacity
            onPress={handleDelete}
            className="absolute top-5 right-5 bg-[#fc3903] p-3 rounded-full shadow-lg z-10"
          >
            <Ionicons name="trash" size={22} color="#fbf5f4ff" />
          </TouchableOpacity>
        )}

        {/* Image section */}
          <Image
              source={{ uri: localItem.processedUri || localItem.imageUri }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
          />

        {/* Description */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Description</Text>
        <TextInput
          value={localItem.imgDescription}
          onChangeText={(v) => handleChange("imgDescription", v)}
          className="bg-white p-3 rounded-xl mt-2"
          placeholder="e.g. Black Hoodie"
        />

        {/* Category */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Category</Text>
        <SingleSelectChips
          options={categories}
          selectedId={localItem.categoryId}
          onChange={(id) => handleChange("categoryId", id)}
        />


        {/* Subcategory */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Subcategory</Text>

        {!localItem.categoryId ? (
          <Text className="text-white/70 mt-2">Select a category first.</Text>
        ) : subcategories.length === 0 ? (
          <Text className="text-white/70 mt-2">No subcategories yet. Add one in Wardrobe.</Text>
        ) : (
          <SingleSelectChips
            options={subcategories}
            selectedId={localItem.subcategoryId}
            onChange={(id) => handleChange("subcategoryId", id)}
          />
        )}


        {/* Colors */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Colors</Text>
        <TagInput
          tags={localItem.colors?? []}
          onChange={(tags) => handleChange("colors", tags)}
          placeholder="Add colors..."
        />

        {/* Materials */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Materials</Text>
        <TagInput
          tags={localItem.materials?? []}
          onChange={(tags) => handleChange("materials", tags)}
          placeholder="Add materials..."
        />

        {/* Occasion */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Occasion</Text>
        <TagInput
          tags={localItem.occasion?? []}
          onChange={(tags) => handleChange("occasion", tags)}
          placeholder="Add occasions..."
        />

        {/* Season */}
        <Text className="text-[#d5f2e3] text-lg font-bold mt-6">Season</Text>
        <MultiSelectValues
          values={localItem.season ?? []}
          onChange={(v) => handleChange("season", v)}
          list={SEASONS}
        />

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#579468] p-4 rounded-xl mt-10"
        >
          <Text className="text-center text-white text-lg font-bold">Save Item</Text>
        </TouchableOpacity>
    </KeyboardAwareScrollView>
    </ScrollView>
  );
}
