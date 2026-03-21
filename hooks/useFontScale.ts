import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "fontScale";

export default function useFontScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) setScale(Number(v));
    });
  }, []);

  const updateScale = async (value: number) => {
    setScale(value);
    await AsyncStorage.setItem(KEY, String(value));
  };

  return { scale, updateScale };
} 