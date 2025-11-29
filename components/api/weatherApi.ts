import * as Location from "expo-location";

export const getWeather = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission denied!");
      return null;
    }

    const FASTAPI_URL = "http://192.168.0.12:8000";

    let loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    const res = await fetch(
      `${FASTAPI_URL}/weather/?lat=${lat}&lon=${lon}`
    );

    return await res.json();
  } catch (error) {
    console.log("Weather fetch failed:", error);
    return null;
  }
};
