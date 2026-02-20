import { useAuth } from "@/context/AuthContext";
import { FASTAPI_URL } from "@/IP_Config";
import { Category, EditableItem, Subcategory } from "@/types/items";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { fetchColorOptions, NAME_TO_HEX } from "./api/colorsApi";
import { createItem, updateItem } from "./api/itemApi";
import { fetchMaterialOptions } from "./api/materialsApi";
import { fetchOccasionOptions } from "./api/occasionApi";
import ColorPalettePicker from "./colorPalettePicker";
import { SEASONS } from "./lists";
import { MultiSelectValues } from "./multiSelectValues";
import OptionSheetPicker from "./optionSheetPicker";
import { SingleSelectChips } from "./singleSelectValues";



export default function ImageEditCard({ item }: { item: any }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [colorOptions, setColorOptions] = useState<{ id: string; name: string; hex: string }[]>([]);
  const [materialOptions, setMaterialOptions] = useState<{ id: string; name: string;}[]>([]);
  const [occasionOptions, setOccasionOptions] = useState<{ id: string; name: string;}[]>([]);

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
    occasions: item.occasions ?? [],
    seasons: item.seasons ?? [],
    in_laundry: item.in_laundry ?? false,
    last_worn_at: item.last_worn ?? null,
  });

  console.log(  "EditableItemCard render with item:", localItem);

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

  useEffect(() => {
      if (!user?.id) return;

      let alive = true; // prevents state update after unmount

      (async () => {
        try {
          const [
            materials,
            colors,
            occasions,
          ] = await Promise.all([
            fetchMaterialOptions(user.id),
            fetchColorOptions(user.id),
            fetchOccasionOptions(user.id),
          ]);

          if (!alive) return;

          setMaterialOptions(
            materials.map(o => ({ id: o.id, name: o.name }))
          );

          setColorOptions(
            colors.map(c => ({
              id: c.id,
              name: c.name,
              hex: NAME_TO_HEX[c.name.trim().toLowerCase()] ?? "#777",
            }))
          );

          setOccasionOptions(
            occasions.map(o => ({ id: o.id, name: o.name }))
          );

        } catch (e) {
          console.log("Failed to fetch attribute options", e);

          if (!alive) return;
          setMaterialOptions([]);
          setColorOptions([]);
          setOccasionOptions([]);
        }
      })();

      return () => {
        alive = false;
      };
    }, [user?.id]);

 

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

      setStatus("success");
      setTimeout(() => router.back(), 800);

    } catch (e: any) {
      setStatus("error");
    }
  };

  return (
  <View className="flex-1 bg-white">
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-4 pt-4">
        {/* Top row actions */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-[12px] tracking-[2px] text-black">EDIT ITEM</Text>

          {localItem.id !== null && (
            <TouchableOpacity
              onPress={handleDelete}
              className="border border-[#E6E6E6] px-3 py-2"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-[12px] tracking-[1.5px] text-black">DELETE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Image */}
        <View
          className="mt-4 border border-[#E6E6E6] bg-[#F7F7F7] overflow-hidden"
          style={{ borderRadius: 6 }}
        >
          <View style={{ aspectRatio: 2 / 3 }}>
            <Image
              source={{ uri: localItem.processedUri || localItem.imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text className="mt-6 text-[11px] tracking-[1.8px] text-[#6E6E6E]">DESCRIPTION</Text>
        <TextInput
          value={localItem.imgDescription}
          onChangeText={(v) => handleChange("imgDescription", v)}
          className="mt-2 border border-[#E6E6E6] px-3 text-[13px] text-black"
          style={{ borderRadius: 4, height: 42 }}
          placeholder="e.g. Black Hoodie"
          placeholderTextColor="#9A9A9A"
        />

        {/* CATEGORY */}
        <Text className="mt-6 text-[11px] tracking-[1.8px] text-[#6E6E6E]">CATEGORY</Text>
        <View className="mt-2">
          <SingleSelectChips
            options={categories}
            selectedId={localItem.categoryId}
            onChange={(id) => handleChange("categoryId", id)}
          />
        </View>

        {/* SUBCATEGORY */}
        <Text className="mt-6 text-[11px] tracking-[1.8px] text-[#6E6E6E]">SUBCATEGORY</Text>

        {!localItem.categoryId ? (
          <Text className="text-[12px] text-[#6E6E6E] mt-2">Select a category first.</Text>
        ) : subcategories.length === 0 ? (
          <Text className="text-[12px] text-[#6E6E6E] mt-2">No subcategories yet. Add one in Wardrobe.</Text>
        ) : (
          <View className="mt-2">
            <SingleSelectChips
              options={subcategories}
              selectedId={localItem.subcategoryId}
              onChange={(id) => handleChange("subcategoryId", id)}
            />
          </View>
        )}

        {/* COLORS */}
        <View className="mt-2">
          <ColorPalettePicker
            label="COLORS"
            selected={localItem.colors ?? []}
            onChange={(tags) => handleChange("colors", tags)}
            options={colorOptions}
            //onManagePress={() => router.push("/settings/manage-attributes?tab=colors")}
          />
        </View>

        {/* Materials */}
        <View className="mt-2">
          <OptionSheetPicker
            label="Materials"
            selected={localItem.materials ?? []}
            onChange={(next) => handleChange("materials", next)}
            options={materialOptions}
            columns={2}
            chooseText="CHOOSE MATERIALS"
            emptyText="No materials selected"
          />
          </View>

        {/* Occasion */}
         <View className="mt-2">
          <OptionSheetPicker
            label="Occasion"
            selected={localItem.occasions ?? []}
            onChange={(next) => handleChange("occasions", next)}
            options={occasionOptions}
            columns={2}
            chooseText="CHOOSE OCCASIONS"
            emptyText="No occasions selected"
          />
          </View>

        {/* SEASON */}
        <Text className="mt-8 text-[11px] tracking-[1.8px] text-[#6E6E6E]">SEASON</Text>
        <View className="mt-2">
          <MultiSelectValues
            values={localItem.seasons ?? []}
            onChange={(v) => handleChange("seasons", v)}
            list={SEASONS}
          />
        </View>

         {/* LAST WORN */}
        <View className="mt-2 flex-row items-center justify-between border border-[#E6E6E6] px-4 py-3" style={{ borderRadius: 4 }}>
          <Text className="text-[12px] tracking-[1.5px] text-black">LAST WORN</Text>
          <Text className="text-[12px] tracking-[1.5px] text-black">{localItem.last_worn_at ?? "--"}</Text>
        </View>
        

        {/* LAUNDRY */}
        <View className="mt-2 flex-row items-center justify-between border border-[#E6E6E6] px-4 py-3" style={{ borderRadius: 4 }}>
          <Text className="text-[12px] tracking-[1.5px] text-black">IN LAUNDRY</Text>
          <Switch value={!!localItem.in_laundry} onValueChange={(val) => handleChange("in_laundry", val)}  />
        </View>

        {/* SAVE */}
        <TouchableOpacity
          onPress={handleSave}
          className="mt-4 bg-black items-center justify-center rounded-4 h-12"
        >
          <Text className="text-white text-[12px] tracking-[2px]">SAVE</Text>
        </TouchableOpacity>
      </View>

      {status === "success" && (
          <View className="border border-black bg-[#579468] px-4 py-3 mb-3 mt-6" style={{ borderRadius: 4 }}>
            <Text className="text-[12px] tracking-[1.5px] text-black">
              SAVED SUCCESSFULLY
            </Text>
          </View>
        )}

    </KeyboardAwareScrollView>
  </View>
);
}