
//import formatDate from "@/app/helper/dateFormat";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import formatDate from "@/helper/dateFormat";
import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";
import { Category, EditableItem, Subcategory } from "@/types/items";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { fetchColorOptions, NAME_TO_HEX } from "./api/colorsApi";
import { createItem, updateItem } from "./api/itemApi";
import { fetchMaterialOptions } from "./api/materialsApi";
import { fetchOccasionOptions } from "./api/occasionApi";
import ColorPalettePicker from "./colorPalettePicker";
import DeleteButton from "./deleteButton";
import { SEASONS } from "./lists";
import { MultiSelectValues } from "./multiSelectValues";
import OptionSheetPicker from "./optionSheetPicker";
import { SingleSelectChips } from "./singleSelectValues";



export default function ImageEditCard({ item,onSaved }: { item: any, onSaved?: () => void }) {
  const { user } = useAuth();
  const { scale } = useFontScale();
  const Typography = createTypography(scale);
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
    last_worn_at: item.last_worn_at ?? null,
    created_at: item.created_at,
  });

  const handleChange = (field: keyof EditableItem, value: any) => {
    setLocalItem((prev) => ({ ...prev, [field]: value }));
  };

  const fetchSubcategories = async (categoryId: number) => {
  try {
    const res = await authFetch(
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
    authFetch(`${FASTAPI_URL}/categories/`)
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
            fetchMaterialOptions(),
            fetchColorOptions(),
            fetchOccasionOptions(),
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
          await authFetch(`${FASTAPI_URL}/items/${localItem.id}`, {
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
          const isEditing = Boolean(localItem.id);

          if (isEditing) {
            await updateItem(localItem.id, localItem, user.id);
          } else {
            await createItem(user.id, localItem);
          }

          setStatus("success");

          setTimeout(async () => {
            if (isEditing) {
              router.back();
            } else {
              await onSaved?.();
            }
          }, 900);
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
      <View className="px-4">
        {/* Top row actions */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="tracking-[2px] text-black" style={{ fontSize: Typography.body.fontSize * 0.99 }}>EDIT ITEM</Text>

          {localItem.id !== null && (
            <DeleteButton
              onPress={handleDelete}
              variant="filled"
              shape="circle"
              size="sm"
            />
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
        <Text className="mt-6 tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize }}>DESCRIPTION</Text>
        <TextInput
          value={localItem.imgDescription}
          onChangeText={(v) => handleChange("imgDescription", v)}
          className="mt-2 border border-[#E6E6E6] px-3 text-black"
          style={{ borderRadius: 4, height: 46, fontSize: Typography.body.fontSize * 1.05 }}
          placeholder="e.g. Black Hoodie"
          placeholderTextColor="#9A9A9A"
        />

        {/* CATEGORY */}
        <Text className="mt-6 tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>CATEGORY</Text>
        <View className="mt-2">
          <SingleSelectChips
            options={categories}
            selectedId={localItem.categoryId}
            onChange={(id) => handleChange("categoryId", id)}
          />
        </View>

        {/* SUBCATEGORY */}
        <Text className="mt-6 tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>SUBCATEGORY</Text>

        {!localItem.categoryId ? (
          <Text className="mt-2 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>Select a category first.</Text>
        ) : subcategories.length === 0 ? (
          <Text className="mt-2 text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.75 }}>No subcategories yet. Add one in Wardrobe.</Text>
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
          />
        </View>

        {/* Materials */}
        <View className="mt-2">
          <OptionSheetPicker
            label="Materials"
            selected={localItem.materials ?? []}
            onChange={(next) => handleChange("materials", next)}
            options={materialOptions}
            columns={3}
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
            columns={3}
            chooseText="CHOOSE OCCASIONS"
            emptyText="No occasions selected"
          />
          </View>

        {/* SEASON */}
        <Text className="mt-8 tracking-[1.8px] text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize * 0.95 }}>SEASON</Text>
          <View className="mt-2">
            <MultiSelectValues
              values={localItem.seasons ?? []}
              onChange={(v) => handleChange("seasons", v)}
              list={SEASONS}
            />
          </View>

         {/* LAST WORN */}
        <View className="mt-2 flex-row items-center justify-between border border-[#E6E6E6] px-4 py-3" style={{ borderRadius: 4 }}>
          <Text className="tracking-[1.5px] text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>LAST WORN</Text>
          <Text className="tracking-[1.5px] text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>{formatDate(localItem.last_worn_at ?? localItem.created_at)}</Text>
        </View>
        

        {/* LAUNDRY */}
        <View className="mt-2 flex-row items-center justify-between border border-[#E6E6E6] px-4 py-1" style={{ borderRadius: 4 }}>
          <Text className="tracking-[1.5px] text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>IN LAUNDRY</Text>
          <Switch value={!!localItem.in_laundry} onValueChange={(val) => handleChange("in_laundry", val)}  />
        </View>

        {/* SAVE */}
        <TouchableOpacity
          onPress={handleSave}
          className="mt-4 bg-black items-center justify-center rounded-4 h-12"
        >
          <Text className="tracking-[2px] text-white" style={{ fontSize: Typography.body.fontSize * 0.95 }}>SAVE</Text>
        </TouchableOpacity>
      </View>

      <Modal
          visible={status === "success"}
          transparent
          animationType="fade"
        >
          <View className="flex-1 justify-center items-center bg-black/30">
            <View
              className="bg-white px-6 py-6 items-center"
              style={{ borderRadius: 10, width: 220 }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: "#0b6623" }}
              >
                <Text className="text-white" style={{ fontSize: Typography.section.fontSize }}>✓</Text>
              </View>

              <Text className="text-center tracking-[1px] text-black" style={{ fontSize: Typography.body.fontSize * 0.95 }}>
                {localItem.id ? "Changes saved" : "Added to wardrobe"}
              </Text>
            </View>
          </View>
        </Modal>

    </KeyboardAwareScrollView>
  </View>
);
}