import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text className="text-[12px] tracking-[2px] text-black text-center">WARDORAI</Text>
            <Text className="text-[22px] tracking-[0.5px] text-black text-center mt-2">
              Sign in
            </Text>
          </Animated.View>

          {/* Form card */}
          <View className="mt-8 border border-[#E6E6E6] bg-white p-5" style={{ borderRadius: 6 }}>
            {/* Email */}
            <Text className="text-[11px] tracking-[1.5px] text-[#6E6E6E] mb-2">EMAIL</Text>
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
            <View
              className="flex-row items-center border border-[#E6E6E6] px-3"
              style={{ borderRadius: 4, height: 42 }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                placeholderTextColor="#9A9A9A"
                className="flex-1 text-[13px] text-black"
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)} className="pl-2 py-2">
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#111111" />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {errorMessage !== "" && (
              <Text className="text-[#B00020] text-[12px] mt-3">
                {errorMessage}
              </Text>
            )}

            {/* Forgot password */}
            <TouchableOpacity className="mt-4">
              <Text className="text-[12px] tracking-[1px] text-black underline">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Sign in button */}
            <TouchableOpacity
              onPress={handleLogin}
              className="mt-5 bg-black items-center justify-center"
              style={{ borderRadius: 4, height: 44 }}
            >
              <Text className="text-white text-[12px] tracking-[1.8px]">SIGN IN</Text>
            </TouchableOpacity>

            {/* Register link */}
            <Link href="/register-modal-view" asChild>
              <TouchableOpacity className="mt-5">
                <Text className="text-center text-[12px] tracking-[1px] text-black">
                  Don’t have an account? <Text className="underline">Register</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
