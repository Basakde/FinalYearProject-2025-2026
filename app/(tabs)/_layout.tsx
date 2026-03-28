import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import "./global.css";

export default function TabLayout() {
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }} 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#831616",
        tabBarInactiveTintColor: "#8A8A8A",

        tabBarStyle: {
          backgroundColor: "#F2F2F2",
          borderTopColor: "#E0E0E0",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 14,
        },

        tabBarItemStyle: {
          paddingTop: 4,
        },

        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 0.7,
          textTransform: "uppercase",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={15} color={color} />
          ),
        }}
      />

      {/* WARDROBE */}
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color }) => (
            <Ionicons name="shirt-outline" size={15} color={color} />
          ),
        }}
      />
      
      {/* CALENDAR */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={15} color={color} />
          ),
        }}
      />

      {/* PICK OUTFIT */}
      <Tabs.Screen
        name="pickOutfit"
        options={{
          title: "Pick Outfit",
          tabBarIcon: ({ color }) => (
            <Ionicons name="color-wand-outline" size={15} color={color} />
          ),
        }}
      />

      {/* MY STYLIST */}
      <Tabs.Screen
        name="myStylist"
        options={{
          title: "My Stylist",
          tabBarIcon: ({ color }) => (
            <Ionicons name="sparkles-outline" size={15} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settingScreen"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={15} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
