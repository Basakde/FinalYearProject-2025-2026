import { useImages } from '@/context/ImageContext';
import * as ImagePicker from 'expo-image-picker';
import { usePathname, useRouter } from 'expo-router';
import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

interface OpenCameraButtonProps {
  onPress?: () => void;
}

const OpenCameraButton: React.FC<OpenCameraButtonProps> = ({ onPress }) => {

  const{addImages}=useImages();
  const router = useRouter();
  const pathname = usePathname();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', "livePhotos"],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection:true
    });


    if (!result.canceled && result.assets) {
      const selectedImagesUri = result.assets.map((asset) => asset.uri);
      selectedImagesUri.forEach((uri) => addImages(uri));
      // Navigate to the image view modal and pass params
      router.push({
        pathname: '/image-gallery-view', 
      });
    }
  };

    return ( 
      <>
        <TouchableOpacity
            className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
            onPress={pickImage}
        >
            <Text className="text-white text-lg">
                <Image 
                    source={require("../assets/images/gallery.png")}
                    style={{ width: 30, height: 30}} 
                />
           </Text>
        </TouchableOpacity>
      </>
    );
};
export default OpenCameraButton;