import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, onChange, placeholder }: TagInputProps) => {
  const [text, setText] = useState("");

  const addTag = () => {
    if (text.trim() && !tags.includes(text.trim())) {
      onChange([...tags, text.trim()]);
      setText("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <View className="flex-wrap flex-row items-center">
      {tags.map(tag => (
        <TouchableOpacity
          key={tag}
          onPress={() => removeTag(tag)}
          className="bg-gray-200 px-2 py-1 rounded-full m-1"
        >
          <Text>{tag} ✕</Text>
        </TouchableOpacity>
      ))}
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={addTag}
        placeholder={placeholder || "Add tag..."}
        className="border p-2 rounded-md flex-1"
      />
    </View>
  );
};
