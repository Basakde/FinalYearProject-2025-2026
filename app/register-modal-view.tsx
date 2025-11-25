import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Animated,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseConfig";

export default function RegisterScreen() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername]= useState("");
  const router = useRouter();

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log("Registration failed:", error.message);
      return;
    }

    const user = data?.user;
    if (user) {
      try {
        await fetch("http://192.168.0.12:8000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
          }),
        });
      } catch (err) {
        console.error("Error creating user in DB:", err);
      }
    }

    router.replace("/login-modal-view");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E8998D]">
      {/* Soft gradient using your color palette */}
      <View className="absolute inset-0 bg-gradient-to-br from-[#FBF7F4] via-[#EED2CC] to-[#E8998D]" />

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-6">

          {/* Register Card */}
          <View className="w-full max-w-sm bg-[#FBF7F4]/70 p-8 rounded-3xl border border-[#6C9A8B]/40 shadow-xl backdrop-blur-xl">

            {/* Animated Title */}
            <Animated.Text
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="text-center text-4xl font-extrabold mb-8 text-[#6C9A8B]"
            >
              Create Account
            </Animated.Text>

            {/* Username */}
            <Text className="text-[#6C9A8B] mb-1 font-semibold">Username</Text>
            <TextInput
              className="border border-[#6C9A8B]/50 bg-white text-[#6C9A8B] p-3 rounded-xl mb-5"
              placeholder="Enter username"
              placeholderTextColor="#EED2CC"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            {/* Email */}
            <Text className="text-[#6C9A8B] mb-1 font-semibold">Email</Text>
            <TextInput
              className="border border-[#6C9A8B]/50 bg-white text-[#6C9A8B] p-3 rounded-xl mb-5"
              placeholder="Enter email"
              placeholderTextColor="#EED2CC"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text className="text-[#6C9A8B] mb-1 font-semibold">Password</Text>
            <TextInput
              className="border border-[#6C9A8B]/50 bg-white text-[#6C9A8B] p-3 rounded-xl mb-5"
              placeholder="Enter password"
              placeholderTextColor="#EED2CC"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Register Button */}
            <TouchableOpacity
              className="bg-[#b5bfa1] p-3 rounded-xl shadow-md"
              onPress={handleRegister}
            >
              <Text className="text-white text-center font-bold text-lg">
                Register
              </Text>
            </TouchableOpacity>

            {/* Go to login */}
            <TouchableOpacity
              onPress={() => router.push("/login-modal-view")}
              className="mt-5"
            >
              <Text className="text-center text-[#6e9887] font-semibold">
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
