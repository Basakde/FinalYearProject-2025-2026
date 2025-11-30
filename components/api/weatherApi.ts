import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const FASTAPI_URL = "http://192.168.0.12:8000";
const CACHE_KEY = "weatherCache";
const CACHE_DURATION_MIN = 15;

export const getCachedWeather = async () => {
  const stored = await AsyncStorage.getItem(CACHE_KEY);
  if (!stored) return null;

  const parsed = JSON.parse(stored);
  const ageMin = (Date.now() - parsed.timestamp) / 1000 / 60;

  if (ageMin < CACHE_DURATION_MIN) return parsed;

  return null;
};

export const getWeather = async () => {
  try {
    // Check cached weather first
    const cached = await getCachedWeather();
    if (cached) return cached;

    //  Request location permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    // Reverse geocode to get city name
    const place = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const city = place[0]?.city || "";

    const res = await fetch(`${FASTAPI_URL}/weather/?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    const weatherData = {
      ...data,
      city,
      timestamp: Date.now(),
    };

    // Save to cache
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(weatherData));

    return weatherData;
  } catch (error) {
    console.log("Weather fetch failed:", error);
    return null;
  }
};
