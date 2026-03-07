import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseConfig";

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleUpdatePassword = async () => {
    setErrorMessage("");
    setMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("Password updated successfully.");

      setTimeout(() => {
        router.replace("/");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text className="text-[12px] tracking-[2px] text-black text-center">WARDORAI</Text>
            <Text className="text-[22px] tracking-[0.5px] text-black text-center mt-2">
              Reset password
            </Text>
            <Text className="text-[12px] text-[#6E6E6E] text-center mt-3 leading-5">
              Enter your new password below.
            </Text>
          </Animated.View>

          <View className="mt-8 border border-[#E6E6E6] bg-white p-5" style={{ borderRadius: 6 }}>
            <Text className="text-[11px] tracking-[1.5px] text-[#6E6E6E] mb-2">NEW PASSWORD</Text>
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

            <Text className="text-[11px] tracking-[1.5px] text-[#6E6E6E] mb-2 mt-5">CONFIRM PASSWORD</Text>
            <View
              className="flex-row items-center border border-[#E6E6E6] px-3"
              style={{ borderRadius: 4, height: 42 }}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor="#9A9A9A"
                className="flex-1 text-[13px] text-black"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)} className="pl-2 py-2">
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="#111111" />
              </TouchableOpacity>
            </View>

            {errorMessage !== "" && (
              <Text className="text-[#B00020] text-[12px] mt-3">
                {errorMessage}
              </Text>
            )}

            {message !== "" && (
              <Text className="text-[#1B5E20] text-[12px] mt-3">
                {message}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleUpdatePassword}
              disabled={loading}
              className="mt-5 bg-black items-center justify-center"
              style={{ borderRadius: 4, height: 44, opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-white text-[12px] tracking-[1.8px]">
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </Text>
            </TouchableOpacity>

            <Link href="/login-modal-view" asChild>
              <TouchableOpacity className="mt-5">
                <Text className="text-center text-[12px] tracking-[1px] text-black underline">
                  Back to sign in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}