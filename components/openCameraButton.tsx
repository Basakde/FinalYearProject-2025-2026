import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

interface OpenCameraButtonProps {
  onPress?: () => void;
}



const OpenCameraButton: React.FC<OpenCameraButtonProps> = ({ onPress }) => {
    const router=useRouter();
    const pathname=usePathname();

    const handleOnPress = () => {
        router.push("/camera-view");
        };

    return ( 
        <TouchableOpacity
            className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
            onPress={handleOnPress}
        >
            <Text className="text-white text-lg">
                <Image 
                    source={require("../assets/images/camera.png")}
                    style={{ width: 30, height: 30}} 
                />
           </Text>
        </TouchableOpacity>
    );
};
export default OpenCameraButton;