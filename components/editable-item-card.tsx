
import { TagInput } from "@/components/tag-input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabase/supabaseConfig";
import { EditableItem } from "@/types/items";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import React, { useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


interface EditableItemProps {
  item: EditableItem;
  onUpdate: (updated: EditableItem) => void;
  className?:string;
}

export default function ImageEditCard({
     item,
     onUpdate,
     className
     }: EditableItemProps) {
  const [localItem, setLocalItem] = useState<EditableItem>(item);
  const { user } = useAuth();

  const handleChange = <K extends keyof EditableItem>(field: K, value: EditableItem[K]) => {
    const updated = { ...localItem, [field]: value };
    setLocalItem(updated);
    onUpdate(updated);
  };


  const handleSave = async () => {
  console.log("🟦 handleSave triggered");

  try {
    const filePath = `${user.id}/${Date.now()}.jpg`;
    console.log("📁 File path:", filePath);

    //  Read image
    const base64 = await FileSystem.readAsStringAsync(localItem.imageUri, {
      encoding: "base64",
    });
    console.log("Base64 length:", base64.length);

    // Convert to binary
    const imageBuffer = decode(base64);
    console.log("Converted to ArrayBuffer");

    // Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("wardrobe-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error(" Upload error:", uploadError);
      throw uploadError;
    }

    console.log("Upload success:", uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("wardrobe-images")
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;
    console.log("🌐 Public URL:", publicUrl);

    // Send to backend
    const payload = {
      user_id: user.id,
      image_url: publicUrl,
      category: localItem.category,
      subcategory: localItem.subCategory,
      img_description: localItem.imgDescription,
    };
    console.log(" Sending payload:", payload);

    const response = await fetch("http://192.168.0.12:8000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);

    const result = await response.json();
    console.log("Saved successfully:", result);
  } catch (err) {
    console.error("Error saving item:", err);
  }
};

  return (
    <ScrollView className={`p-3 rounded-xl ${className}`}>
        <KeyboardAwareScrollView>
            {/* Image section */}
            <Image
                source={{ uri: localItem.processedUri || localItem.imageUri }}
                style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
            />

             {/* Image Description*/}
            <Text className="mt-4 font-bold text-lg">Category</Text>
            <TextInput
                value={localItem.imgDescription}
                onChangeText={(text) => handleChange("imgDescription", text)}
                placeholder="e.g. Top, Bottom..."
                className="border p-2 rounded-md mt-1"
            />

            {/* Category */}
            <Text className="mt-4 font-bold text-lg">Category</Text>
            <TextInput
                value={localItem.category}
                onChangeText={(text) => handleChange("category", text)}
                placeholder="e.g. Top, Bottom..."
                className="border p-2 rounded-md mt-1"
            />

            {/* Subcategory */}
            <Text className="mt-4 font-bold text-lg">Subcategory</Text>
            <TextInput
                value={localItem.subCategory}
                onChangeText={(text) => handleChange("subCategory", text)}
                placeholder="e.g. Hoodie, Jeans..."
                className="border p-2 rounded-md mt-1"
            />

            {/* Colors */}
            <Text className="mt-4 font-bold text-lg">Colors</Text>
            <TagInput
                tags={localItem.colors || []}
                onChange={(newTags) => handleChange("colors", newTags)}
                placeholder="Add color..."
            />

            {/* Materials */}
            <Text className="mt-4 font-bold text-lg">Materials</Text>
            <TagInput
                tags={localItem.materials || []}
                onChange={(newTags) => handleChange("materials", newTags)}
                placeholder="Add material..."
            />

            {/* Occasions */}
            <Text className="mt-4 font-bold text-lg">Occasions</Text>
            <TagInput
                tags={localItem.occasion || []}
                onChange={(newTags) => handleChange("occasion", newTags)}
                placeholder="Add occasion..."
            />

            {/* Seasons */}
            <Text className="mt-4 font-bold text-lg">Seasons</Text>
            <TagInput
                tags={localItem.season || []}
                onChange={(newTags) => handleChange("season", newTags)}
                placeholder="Add season..."
            />

          <TouchableOpacity onPress={() => handleSave()}>
            <Text className="text-white text-center font-bold">Save Item</Text>
          </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ScrollView>
  );
}
