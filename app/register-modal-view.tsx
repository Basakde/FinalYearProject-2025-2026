import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseConfig";
import { FASTAPI_URL } from "@/IP_Config";

export default function RegisterScreen() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRegister = async () => {
    setErrorMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const user = data?.user;
    if (user) {
      try {
        await fetch(`${FASTAPI_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            // username, // include only if your backend accepts it
          }),
        });
      } catch (err) {
        console.error("Error creating user in DB:", err);
      }
    }

    router.replace("/login-modal-view");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text className="text-[12px] tracking-[2px] text-black text-center">WARDORAI</Text>
            <Text className="text-[22px] tracking-[0.5px] text-black text-center mt-2">
              Create account
            </Text>
          </Animated.View>

          {/* Form */}
          <View className="mt-8 border border-[#E6E6E6] bg-white p-5" style={{ borderRadius: 6 }}>
            {/* Email */}
            <Text className="text-[11px] tracking-[1.5px] text-[#6E6E6E] mb-2 mt-5">EMAIL</Text>
            <TextInput
              className="border border-[#E6E6E6] px-3 text-[13px] text-black"
              style={{ borderRadius: 4, height: 42 }}
              placeholder="name@email.com"
              placeholderTextColor="#9A9A9A"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text className="text-[11px] tracking-[1.5px] text-[#6E6E6E] mb-2 mt-5">PASSWORD</Text>
            <TextInput
              className="border border-[#E6E6E6] px-3 text-[13px] text-black"
              style={{ borderRadius: 4, height: 42 }}
              placeholder="••••••••"
              placeholderTextColor="#9A9A9A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Error */}
            {errorMessage !== "" && (
              <Text className="text-[#B00020] text-[12px] mt-3">
                {errorMessage}
              </Text>
            )}

            {/* Create account */}
            <TouchableOpacity
              className="mt-5 bg-black items-center justify-center"
              style={{ borderRadius: 4, height: 44 }}
              onPress={handleRegister}
            >
              <Text className="text-white text-[12px] tracking-[1.8px]">CREATE ACCOUNT</Text>
            </TouchableOpacity>

            {/* Back to login */}
            <TouchableOpacity onPress={() => router.push("/login-modal-view")} className="mt-5">
              <Text className="text-center text-[12px] tracking-[1px] text-black">
                Already have an account? <Text className="underline">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
