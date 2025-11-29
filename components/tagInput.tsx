import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";

export function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();

    if (value.length === 0) return;

    // lowercase & unique
    const newTag = value.toLowerCase();
    if (!tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }

    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View className="w-full mt-2">
      
      {/* TAGS */}
      <View className="flex-row flex-wrap">
        {tags.map((tag) => (
          <View
            key={tag}
            className="flex-row bg-[#E8998D]/20 px-3 py-2 rounded-full mr-2 mb-2"
          >
            <Text>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
              <Text className="ml-2 text-red-500 font-bold">×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* INPUT */}
      <TextInput
        value={input}
        onChangeText={setInput}
        onSubmitEditing={addTag}  // <-- THIS makes "Done" add tags
        returnKeyType="done"
        placeholder={placeholder}
        className="border bg-white p-3 rounded-xl"
      />
    </View>
  );
}
