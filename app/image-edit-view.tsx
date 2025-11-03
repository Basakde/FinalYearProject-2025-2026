import ImageEditCard from "@/components/editable-item-card";
import { useImages } from "@/context/ImageContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ImageEditView() {
  const { image } = useLocalSearchParams();
  const { removeImage } = useImages();
  const router = useRouter();
  console.log("image-edit",image);


  let imageUri="";
  try {
    if (image) {
      imageUri = decodeURIComponent(image as string);

    }
  } catch (err) {
    console.error("Error parsing images:", err);
  }


  const handleSave = (updatedItem: any) => {
    console.log("Saved item:", updatedItem);
    alert("Image processed!");

    removeImage(updatedItem);
    router.back();

  };



  if (!imageUri) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No images left to process!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ImageEditCard
        item={{ imageUri}}
        onUpdate={(updated) => console.log("Updated:", updated)}
        className="w-full"
      />
      <Button title="Save" onPress={() => handleSave(imageUri)} />
    </View>
  );
}
