import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);


  //React Native Animated API for fade and slide effect on mount
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

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E8998D]">
      {/* Soft gradient colors */}
      <View className="absolute inset-0 bg-gradient-to-br from-[#FBF7F4] via-[#EED2CC] to-[#E8998D]" />

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-6">

          {/* Login Card */}
          <View className="w-full max-w-sm bg-[#FBF7F4]/70 p-8 rounded-3xl border border-[#6C9A8B]/40 shadow-xl backdrop-blur-xl">

            {/* Title */}
            <Animated.Text
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="text-center text-4xl font-extrabold mb-8 text-[#6C9A8B]"
            >
              WardorAI
            </Animated.Text>

            {/* Email */}
            <Text className="text-[#6C9A8B] mb-1 font-semibold">Email</Text>
            <TextInput
              className="bg-[#ffffff] border border-[#6C9A8B]/50 bg-white/60 text-[#6C9A8B] p-3 rounded-xl mb-5"
              placeholder="Enter email"
              placeholderTextColor="#EED2CC"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text className="text-[#6C9A8B] font-semibold mb-1">Password</Text>
            <View className="flex-row items-center border border-[#6C9A8B]/50 bg-white/60 text-[#6C9A8B] p-3 rounded-xl mb-3">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#EED2CC"
                placeholder="Enter password"
                className="flex-1"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#6C9A8B"
                />
              </TouchableOpacity>
            </View>

            {/* ERROR MESSAGE */}
            {errorMessage !== "" && (
              <Text className="text-red-500 text-center mb-3">{errorMessage}</Text>
            )}

            {/* Forgot Password */}
            <TouchableOpacity className="mb-4">
              <Text className="text-[#6e9887] text-center underline">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Sign In */}
            <TouchableOpacity
              className="bg-[#b5bfa1] p-3 rounded-xl shadow-md"
              onPress={handleLogin}
            >
              <Text className="text-white text-center font-bold text-lg">
                Sign In
              </Text>
            </TouchableOpacity>

            {/* Register */}
            <Link href="/register-modal-view" asChild>
              <TouchableOpacity className="mt-5">
                <Text className="text-center text-[#6e9887] font-semibold">
                  Don’t have an account? Register
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
