import React, { useEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View, Modal } from "react-native";

interface TagInputProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
  fetchSuggestions?: (query: string) => Promise<string[]>;
}

export const TagInput = ({
  tags,
  onChange,
  placeholder,
  fetchSuggestions,
}: TagInputProps) => {

  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!fetchSuggestions || text.length === 0) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetchSuggestions(text);
      setSuggestions(res);
      setOpen(true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [text]);

  const add = (val: string) => {
    if (!tags.includes(val) && val.trim().length > 0) {
      onChange([...tags, val]);
      setText("");
      setOpen(false);
    }
  };

  return (
    <View className="w-full mt-2">
      {/* TAGS */}
      <View className="flex-row flex-wrap items-center">
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => onChange(tags.filter((t) => t !== tag))}
            className="px-3 py-1 m-1 rounded-full border border-black"
          >
            <Text className="text-black">{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* INPUT */}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#888"
        onSubmitEditing={() => add(text)}
        className="border bg-white p-3 rounded-lg mt-2"
      />

      {/* PORTAL SUGGESTIONS */}
      <Modal
        transparent
        visible={open && suggestions.length > 0}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/20 justify-center px-20"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-xl p-4 max-h-80">
            <FlatList
              nestedScrollEnabled
              data={suggestions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => add(item)}
                  className="px-3 py-3 border-b"
                >
                  <Text className="text-black">{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
