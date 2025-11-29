import { useImages } from '@/context/ImageContext';
import * as ImagePicker from 'expo-image-picker';
import { usePathname, useRouter } from 'expo-router';
import React from "react";
import { Image, TouchableOpacity } from "react-native";

const OpenCameraButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { addImages } = useImages();



  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos"],
      allowsMultipleSelection: true,
      quality: 1,
    });

    // If user cancels → go back HOME
    if (result.canceled) {
      router.back(); 
      return;
    }

    // If user selected images
    if (result.assets) {
      result.assets.forEach(asset => {
        addImages(asset.uri);  // add each image one by one
      });
      
        // small delay so state updates
        await new Promise(res => setTimeout(res, 30));

        // go to gallery
        router.replace("/image-gallery-view");
    }
  };

  return (
    <TouchableOpacity
      className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
      onPress={pickImage}
    >
      <Image
        source={require("../assets/images/gallery.png")}
        style={{ width: 30, height: 30 }}
      />
    </TouchableOpacity>
  );
};

export default OpenCameraButton;
