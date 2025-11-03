import ImageEditCard from "@/components/editable-item-card";
import { useImages } from "@/context/ImageContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ImageEditView() {
  const { imageUri } = useLocalSearchParams();
  const { removeImage } = useImages();
  const router = useRouter();



  let decodedimageUri="";
  try {
    if (imageUri) {
      decodedimageUri = decodeURIComponent(imageUri as string);
      console.log("imageuri",imageUri);

    }
  } catch (err) {
    console.error("Error parsing images:", err);
  }


  const handleSave = (updatedItem: any) => {

    alert("Image processed!");

    removeImage(updatedItem);
    router.back();

  };



  if (!decodedimageUri) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No images left to process!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ImageEditCard
        item={{ imageUri:decodedimageUri}}
        onUpdate={(updated) => console.log("Updated:", updated)}
        className="w-full"
      />
      <Button title="Save" onPress={() => handleSave(imageUri)} />
    </View>
  );
}
