// context/ImageContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from "react";
// Define the structure for each image
export interface ImageData {
  originalUri: string;
  processedUri?: string;
 // tags?: string[];
 // colors?: string[];
}

// Define what the context provides
interface ImageContextType {
  selectedImages:string[];
  setSelectedImages: (images: string[]) => void;
  addImages: (image: string) => void;
  //updateImage: (index: number, updated: Partial<ImageData>) => void;
  removeImage:(image:string) =>void
  //clearImages: () => void;
}

// Create the context
const ImageContext = createContext<ImageContextType | undefined>(undefined);

// Provider component
export const ImageProvider: React.FC<{ children: React.ReactNode }> = 
({ children }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
    // Load images from AsyncStorage on start
  useEffect(() => {
    const loadImages = async () => {
      const savedImages = await AsyncStorage.getItem('selectedImages');
      if (savedImages) {
        setSelectedImages(JSON.parse(savedImages));
      }
    };
    loadImages();
  }, []);

  // Add new image
  const addImages = (image: string) => {
    setSelectedImages((prev) => [...prev, image]);
  };

  // Update existing image by index
 /* const updateImage = (index: number, updated: Partial<string>) => {
    setSelectedImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, ...updated } : img))
    );
  };*/

    useEffect(() => {
    AsyncStorage.setItem('selectedImages', JSON.stringify(selectedImages));
  }, [selectedImages]);

  // Clear all images
  const removeImage = (image: string) => {
    setSelectedImages((prev) => prev.filter((img) => img !== image));
  };

  return (
    <ImageContext.Provider
      value={{ selectedImages, setSelectedImages,addImages,removeImage}}
    >
      {children}
    </ImageContext.Provider>
  );
};

// Hook for using context
export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) throw new Error("useImages must be used within ImageProvider");
  return context;
};
