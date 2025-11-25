import { useAuth } from "@/context/AuthContext";
import { Text, TouchableOpacity } from "react-native";

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <TouchableOpacity
      onPress={logout}
      className="bg-black p-4 rounded-xl"
    >
      <Text className="text-white font-bold text-center mt-10 h-24 w-24">Log Out</Text>
    </TouchableOpacity>
  );
}
