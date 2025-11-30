// context/ImageContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from "react";

interface ImageContextType {
  selectedImages: string[];
  addImages: (images: string[] | string) => void;
  removeImage: (uri: string) => void;
  clearImages: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Load stored images only once
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem("selectedImages");
      if (saved) {
        setSelectedImages(JSON.parse(saved));
      }
    };
    load();
  }, []);

  // Save to storage whenever list changes
  useEffect(() => {
    AsyncStorage.setItem("selectedImages", JSON.stringify(selectedImages));
  }, [selectedImages]);

  // ADD — accepts *one OR many*
  const addImages = (images: string[] | string) => {
    const arr = Array.isArray(images) ? images : [images];

    setSelectedImages(prev => {
      const newList = [...prev, ...arr];
      return newList;
    });
  };

  // REMOVE
  const removeImage = (uri: string) => {
    setSelectedImages(prev => prev.filter(img => img !== uri));
  };

  // CLEAR ALL
  const clearImages = () => {
    setSelectedImages([]);
  };

  return (
    <ImageContext.Provider
      value={{ selectedImages, addImages, removeImage, clearImages }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) throw new Error("useImages must be used inside provider");
  return context;
};
