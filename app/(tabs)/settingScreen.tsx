import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <View className="flex-1 bg-white px-5 pt-10">
      <Text className="text-2xl font-bold mb-6">Settings</Text>

      {/* Manage Attributes */}
      <TouchableOpacity
        onPress={() => router.push("/settings/manage-attributes-view")}
        className="bg-gray-100 p-4 rounded-xl mb-4"
      >
        <Text className="text-black font-semibold">Manage Attributes</Text>
        <Text className="text-gray-600 mt-1">
          Colors, materials, occasions (add / edit / disable)
        </Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        onPress={logout}
        className="bg-black p-4 rounded-xl mt-auto"
      >
        <Text className="text-white font-bold text-center">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
