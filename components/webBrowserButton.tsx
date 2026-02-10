import { TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

export default function WebBrowserButton() {
  return (
    <TouchableOpacity
      onPress={() => router.push("/saved-sites-view")}
      activeOpacity={0.85}
      className="w-14 h-14 bg-white border border-[#E6E6E6] items-center justify-center"
      style={{ borderRadius: 999 }}
    >
      <Image
        source={require("../assets/images/chrome.png")}
        style={{ width: 22, height: 22 }}
      />
    </TouchableOpacity>
  );
}
