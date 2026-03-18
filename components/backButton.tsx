import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";


interface BackButtonProps {
 
}

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (pathname === "/image-gallery-view") {
      router.push("/wardrobe");   // always go to wardrobe
      return;
    }
    router.back();
  };

  return (
    <TouchableOpacity onPress={handleBack} className="w-10 h-10 ml-3 bg-white border border-[#E6E6E6] items-center justify-center" style={{ borderRadius: 999 }}>
      <Ionicons name="arrow-back-outline" size={24} color="black" />
    </TouchableOpacity>
  );
}
