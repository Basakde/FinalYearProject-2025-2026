// src/api/itemAPI.ts

import { supabase } from "@/supabase/supabaseConfig";
import { decode } from "base64-arraybuffer";

const FASTAPI_URL = "http://192.168.0.12:8000";

/**
 * Upload a base64 image to Supabase
 */
export const uploadImage = async (userId: string, base64Uri: string, prefix: string) => {
  const base64 = base64Uri.split(",")[1];
  const buffer = decode(base64);

  const path = `${userId}/${prefix}_${Date.now()}.png`;

  await supabase.storage
    .from("wardrobe-images")
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  const { data } = supabase.storage.from("wardrobe-images").getPublicUrl(path);

  return data.publicUrl;
};

/**
 * Create a new item (first save)
 */
export const createItem = async (userId: string, localItem: any) => {
  let imageUrl = localItem.imageUri;
  let processedUrl = localItem.processedUri;

  // Upload original image if it's base64
  if (!imageUrl.startsWith("http")) {
    imageUrl = await uploadImage(userId, localItem.imageUri, "original");
  }

  // Upload processed image if base64
  if (processedUrl && !processedUrl.startsWith("http")) {
    processedUrl = await uploadImage(userId, localItem.processedUri, "processed");
  }

  const payload = {
    user_id: userId,
    image_url: imageUrl,
    processed_img_url: processedUrl,
    category_id: Number(localItem.categoryId),
    subcategory: localItem.subCategory,
    img_description: localItem.imgDescription,
    colors: localItem.colors,
    materials: localItem.materials,
    occasion: localItem.occasion,
    season: localItem.season,
  };

  const res = await fetch(`${FASTAPI_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create item");
};

/*
 * Update an existing item (edit)
 */

export const updateItem = async (itemId:string, localItem:any, userId:string) => {
  const payload = {
    user_id: userId,
    img_description: localItem.imgDescription,
    category_id: Number(localItem.categoryId),
    subcategory: localItem.subCategory,
    colors: localItem.colors,
    materials: localItem.materials,
    season: localItem.season,
    occasion: localItem.occasion
  };

  await fetch(`${FASTAPI_URL}/item/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
};
