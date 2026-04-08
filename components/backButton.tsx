import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

type BackButtonProps = {
  fallbackHref?: Href;
};

export default function BackButton({ fallbackHref = "/(tabs)/wardrobe" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  };

  return (
    <TouchableOpacity onPress={handleBack} className="w-10 h-10 ml-3 bg-white border border-[#E6E6E6] items-center justify-center" style={{ borderRadius: 999 }}>
      <Ionicons name="arrow-back-outline" size={24} color="black" />
    </TouchableOpacity>
  );
}
