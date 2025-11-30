import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";


interface BackButtonProps {
  containerStyle?: object;
}

export default function BackButton({containerStyle = {}}: BackButtonProps) {
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
    <TouchableOpacity onPress={handleBack} style={containerStyle}>
      <Ionicons name="arrow-back-outline" size={24} color="black" />
    </TouchableOpacity>
  );
}
