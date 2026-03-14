import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type FontScaleValue = {
  scale: number;
  updateScale: (value: number) => Promise<void>;
  loading: boolean;
};

const FontScaleContext = createContext<FontScaleValue | undefined>(undefined);

const STORAGE_KEY = "fontScale";

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScale = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setScale(Number(saved));
      } catch (e) {
        console.log("Failed to load font scale:", e);
      } finally {
        setLoading(false);
      }
    };

    loadScale();
  }, []);

  const updateScale = async (value: number) => {
    setScale(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(value));
    } catch (e) {
      console.log("Failed to save font scale:", e);
    }
  };

  return (
    <FontScaleContext.Provider value={{ scale, updateScale, loading }}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext);
  if (!ctx) {
    throw new Error("useFontScale must be used inside FontScaleProvider");
  }
  return ctx;
}