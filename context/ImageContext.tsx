import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface ImageContextType {
  selectedImages: string[];
  addImages: (images: string[] | string) => Promise<void>;
  removeImage: (uri: string) => Promise<void>;
  clearImages: () => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

const normalizeUri = (uri: string) => {
  if (!uri) return uri;

  if (uri.startsWith("/private/")) return `file://${uri}`;

  return uri;
};

const uniq = (arr: string[]) => Array.from(new Set(arr));

const isLocalFile = (uri: string) =>
  uri.startsWith("file://") || uri.startsWith("/private/");

const getUserStorageKey = (userId: string | undefined) =>
  userId ? `selectedImages_${userId}` : "selectedImages_guest";

const ensureImageDir = async (userId: string | undefined) => {
  const dir = `${FileSystem.documentDirectory}selected-images/${userId ?? "guest"}/`;
  const info = await FileSystem.getInfoAsync(dir);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  return dir;
};

const fileExists = async (uri: string) => {
  try {
    const normalized = normalizeUri(uri);

    if (!isLocalFile(normalized)) return true;

    const info = await FileSystem.getInfoAsync(normalized);
    return info.exists;
  } catch {
    return false;
  }
};

const copyToPermanentStorage = async (uri: string, userId: string | undefined) => {
  const normalized = normalizeUri(uri);

  if (!isLocalFile(normalized)) return normalized;

  if (normalized.startsWith(FileSystem.documentDirectory ?? "")) {
    return normalized;
  }

  const dir = await ensureImageDir(userId);
  const originalName = normalized.split("/").pop() || `image_${Date.now()}.jpg`;
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const newUri = `${dir}${Date.now()}_${safeName}`;

  await FileSystem.copyAsync({
    from: normalized,
    to: newUri,
  });

  return newUri;
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const storageKey = useMemo(() => getUserStorageKey(userId), [userId]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);

        if (!saved) {
          setSelectedImages([]);
          return;
        }

        const parsed = JSON.parse(saved) as unknown;
        const list = Array.isArray(parsed) ? parsed : [];

        const normalized = uniq(
          list
            .filter((x): x is string => typeof x === "string" && x.length > 0)
            .map(normalizeUri)
        );

        const checked = await Promise.all(
          normalized.map(async (uri) => ((await fileExists(uri)) ? uri : null))
        );

        const existingOnly = checked.filter((x): x is string => typeof x === "string");

        setSelectedImages(existingOnly);
        await AsyncStorage.setItem(storageKey, JSON.stringify(existingOnly));
      } catch (error) {
        console.log("Failed to load selected images:", error);
        setSelectedImages([]);
        await AsyncStorage.removeItem(storageKey);
      }
    };

    loadImages();
  }, [storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(selectedImages));
  }, [selectedImages, storageKey]);

  const addImages = async (images: string[] | string) => {
    const arr = Array.isArray(images) ? images : [images];

    const copiedUris = await Promise.all(
      arr.map(async (uri) => {
        try {
          return await copyToPermanentStorage(uri, userId);
        } catch (error) {
          console.log("Failed to copy image:", uri, error);
          return null;
        }
      })
    );

    const validUris = copiedUris.filter((x): x is string => typeof x === "string");

    setSelectedImages((prev) => uniq([...prev, ...validUris]));
  };

  const removeImage = async (uri: string) => {
    const normalizedTarget = normalizeUri(uri);

    setSelectedImages((prev) =>
      prev.filter((img) => normalizeUri(img) !== normalizedTarget)
    );

    try {
      if (isLocalFile(normalizedTarget)) {
        const info = await FileSystem.getInfoAsync(normalizedTarget);
        if (info.exists) {
          await FileSystem.deleteAsync(normalizedTarget, { idempotent: true });
        }
      }
    } catch (error) {
      console.log("Failed to delete image:", error);
    }
  };

  const clearImages = async () => {
    try {
      for (const uri of selectedImages) {
        const normalized = normalizeUri(uri);

        if (isLocalFile(normalized)) {
          const info = await FileSystem.getInfoAsync(normalized);
          if (info.exists) {
            await FileSystem.deleteAsync(normalized, { idempotent: true });
          }
        }
      }
    } catch (error) {
      console.log("Failed while clearing images:", error);
    }

    setSelectedImages([]);
    await AsyncStorage.removeItem(storageKey);
  };

  return (
    <ImageContext.Provider value={{ selectedImages, addImages, removeImage, clearImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImages must be used inside provider");
  }
  return context;
};