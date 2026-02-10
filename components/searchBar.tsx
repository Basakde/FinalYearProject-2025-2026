import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;                          // ✅ add
  onChangeText: (text: string) => void;   // ✅ add
  placeholder?: string;
  clearButtonMode?: "never" | "while-editing" | "unless-editing" | "always";
  autoCorrect?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search",
  clearButtonMode = "while-editing",
  autoCorrect = false,
  autoCapitalize = "none",
  className = "flex-1 text-black px-3",
}) => {
  return (
    <View className="flex-row items-center bg-[#fbf7f4] rounded-xl m-4 px-3 py-2 shadow-sm">
      <Ionicons name="search-outline" size={22} color="#9ca3af" />

      <TextInput
        className={className}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        clearButtonMode={clearButtonMode}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
      />

      <Ionicons name="options-outline" size={22} color="#9ca3af" />
    </View>
  );
};

export default SearchBar;
