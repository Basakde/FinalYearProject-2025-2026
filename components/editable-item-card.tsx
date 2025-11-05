
import { TagInput } from "@/components/tag-input";
import { useAuth } from "@/context/AuthContext";
import { useImages } from "@/context/ImageContext";
import { supabase } from "@/supabase/supabaseConfig";
import { EditableItem } from "@/types/items";
import { decode } from "base64-arraybuffer";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


interface EditableItemProps {
  item: EditableItem;
  onUpdate: (updated: EditableItem) => void;
  className?:string;
}

export default function ImageEditCard({
     item,
     onUpdate,
     className,
     }: EditableItemProps) {
  const [localItem, setLocalItem] = useState<EditableItem>(item);
  const { user } = useAuth();
  const { removeImage } = useImages();

  const handleChange = <K extends keyof EditableItem>(field: K, value: EditableItem[K]) => {
    setLocalItem(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    onUpdate(localItem);
  }, [localItem]);


  const FASTAPI_URL="http://192.168.0.12:8000";



const handleSave = async () => {
  if (!localItem.imageUri) {
    Alert.alert("Error", "No image to upload");
    return;
  }

  try {
    // Upload ORIGINAL image if not already uploaded
    let originalUrl = localItem.imageUri;
    if (!originalUrl) {
      const base64Original = localItem.imageUri.split(",")[1];
      const originalBuffer = decode(base64Original);
      const originalPath = `${user.id}/original_${Date.now()}.png`;

      const { error: originalError } = await supabase.storage
        .from("wardrobe-images")
        .upload(originalPath, originalBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (originalError) throw originalError;

      const { data: origData } = supabase.storage
        .from("wardrobe-images")
        .getPublicUrl(originalPath);

      originalUrl = origData.publicUrl;
    }

    // 2️⃣ Upload PROCESSED image (background removed)
    let processedUrl = null;
    if (localItem.processedUri) {
      const base64Processed = localItem.processedUri.split(",")[1];
      const processedBuffer = decode(base64Processed);
      const processedPath = `${user.id}/processed_${Date.now()}.png`;

      const { error: processedError } = await supabase.storage
        .from("wardrobe-images")
        .upload(processedPath, processedBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (processedError) throw processedError;

      const { data: processedData } = supabase.storage
        .from("wardrobe-images")
        .getPublicUrl(processedPath);

      processedUrl = processedData.publicUrl;
      console.log("🪄 Processed image uploaded:", processedUrl);
    }

    //  Send both URLs to backend in ONE call
    const payload = {
      user_id: user.id,
      image_url: originalUrl,
      processed_img_url: processedUrl,
      category: localItem.category,
      subcategory: localItem.subCategory,
      img_description: localItem.imgDescription,
    };

    const res = await fetch(`${FASTAPI_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to post:", text);
      return;
    }

    console.log(" Item saved successfully");

    Alert.alert("Saved", "Your item was saved successfully!");
    router.back();
  } catch (err) {
    console.error(" Error saving item:", err);
    Alert.alert("Error", "Failed to save your item");
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

          <TouchableOpacity onPress={() => handleSave()} className="rounded-xl m-10 bg-cyan-500 h-16 p-5 flex-1 justify-content items-center">
            <Text className="text-white text-center font-bold">Save Item</Text>
          </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ScrollView>
  );
}
