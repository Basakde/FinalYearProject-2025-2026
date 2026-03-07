import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseConfig";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSendReset = async () => {
    setErrorMessage("");
    setMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "wardorai://reset-password-view",
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMessage("Password reset email sent. Please check your inbox.");
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
              Forgot password
            </Text>
            <Text className="text-[12px] text-[#6E6E6E] text-center mt-3 leading-5">
              Enter your email and we’ll send you a link to reset your password.
            </Text>
          </Animated.View>

          <View className="mt-8 border border-[#E6E6E6] bg-white p-5" style={{ borderRadius: 6 }}>
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
              onPress={handleSendReset}
              disabled={loading}
              className="mt-5 bg-black items-center justify-center"
              style={{ borderRadius: 4, height: 44, opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-white text-[12px] tracking-[1.8px]">
                {loading ? "SENDING..." : "SEND RESET LINK"}
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