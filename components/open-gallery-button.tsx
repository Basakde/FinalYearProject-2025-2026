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
  const {selectedImages,setSelectedImages}=useImages();

  const handleOnPress  = () => {
        if(pathname == "/image-gallery-view"){router.replace('/image-gallery-view')}
        else{
        router.push({
        pathname: '/image-gallery-view' as any,
        })
  }};

  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "livePhotos"],
    allowsEditing: false,
    quality: 1,
    allowsMultipleSelection: true,
  });

  if (!result.canceled && result.assets) {
    const selectedImagesUri = result.assets.map(asset => asset.uri);

    // 1️⃣ Add all at once
    setSelectedImages([...selectedImages, ...selectedImagesUri]);

    // 2️⃣ Wait a short tick so state is ready before navigation
    await new Promise(res => setTimeout(res, 50));

    // 3️⃣ Navigate to gallery
    router.push("/image-gallery-view");
  }
};

    return ( 
      <>
        <TouchableOpacity
            className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
            onPress={async()=>{await pickImage();
               handleOnPress();
            }}
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