import { TagInput } from "@/components/tag-input";
import { EditableItem } from "@/types/items";
import React, { useState } from "react";
import { Image, ScrollView, Text, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface EditableItemProps {
  item: EditableItem;
  onUpdate: (updated: EditableItem) => void;
  className?:string;
}

export default function ImageEditCard({
     item,
     onUpdate,
     className
     }: EditableItemProps) {
  const [localItem, setLocalItem] = useState<EditableItem>(item);

  const handleChange = <K extends keyof EditableItem>(field: K, value: EditableItem[K]) => {
    const updated = { ...localItem, [field]: value };
    setLocalItem(updated);
    onUpdate(updated);
  };

  return (
    <ScrollView className={`p-3 rounded-xl ${className}`}>
        <KeyboardAwareScrollView>
            {/* Image section */}
            <Image
                source={{ uri: localItem.processedUri || localItem.imageUri }}
                style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
            />

            {/* Category */}
            <Text className="mt-4 font-bold text-lg">Category</Text>
            <TextInput
                value={localItem.category}
                onChangeText={(text) => handleChange("category", text)}
                placeholder="e.g. Top, Bottom..."
                className="border p-2 rounded-md mt-1"
            />

            {/* Subcategory */}
            <Text className="mt-4 font-bold text-lg">Subcategory</Text>
            <TextInput
                value={localItem.subCategory}
                onChangeText={(text) => handleChange("subCategory", text)}
                placeholder="e.g. Hoodie, Jeans..."
                className="border p-2 rounded-md mt-1"
            />

            {/* Colors */}
            <Text className="mt-4 font-bold text-lg">Colors</Text>
            <TagInput
                tags={localItem.colors || []}
                onChange={(newTags) => handleChange("colors", newTags)}
                placeholder="Add color..."
            />

            {/* Materials */}
            <Text className="mt-4 font-bold text-lg">Materials</Text>
            <TagInput
                tags={localItem.materials || []}
                onChange={(newTags) => handleChange("materials", newTags)}
                placeholder="Add material..."
            />

            {/* Occasions */}
            <Text className="mt-4 font-bold text-lg">Occasions</Text>
            <TagInput
                tags={localItem.occasion || []}
                onChange={(newTags) => handleChange("occasion", newTags)}
                placeholder="Add occasion..."
            />

            {/* Seasons */}
            <Text className="mt-4 font-bold text-lg">Seasons</Text>
            <TagInput
                tags={localItem.season || []}
                onChange={(newTags) => handleChange("season", newTags)}
                placeholder="Add season..."
            />
      </KeyboardAwareScrollView>
    </ScrollView>
  );
}

//      /*<TouchableOpacity
        //lassName="mt-6 bg-blue-500 p-3 rounded-lg"
        //onPress={() => console.log("Save item:", localItem)}
      //>
        //<Text className="text-white text-center font-bold">Save Item</Text>
      //</TouchableOpacity>