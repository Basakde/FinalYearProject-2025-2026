// context/ImageContext.tsx
import React, { createContext, useContext, useState } from "react";

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
  clearImages: () => void;
}

// Create the context
const ImageContext = createContext<ImageContextType | undefined>(undefined);

// Provider component
export const ImageProvider: React.FC<{ children: React.ReactNode }> = 
({ children }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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

  // Clear all images
  const clearImages = () => setSelectedImages([]);

  return (
    <ImageContext.Provider
      value={{ selectedImages, setSelectedImages,addImages,clearImages }}
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
