import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import "./global.css";


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // TAB BAR COLORS
        tabBarActiveTintColor: "#06b6d4", // cyan-500
        tabBarInactiveTintColor: "#474748ff", // gray-400
        tabBarStyle: {
          backgroundColor: "#1e1d1dff", // zinc-900
          borderTopColor: "#d8d8ddff",  // zinc-800 border
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      {/* WARDROBE */}
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color }) => (
            <Ionicons name="shirt-outline" size={22} color={color} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="myStylist"
        options={{
          title: "My Stylist",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={22} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
