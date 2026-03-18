import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

interface OpenCameraButtonProps {
  onPress?: () => void;
}

const OpenCameraButton: React.FC<OpenCameraButtonProps> = ({ onPress }) => {

    return ( 
        <TouchableOpacity
            className="w-14 h-14 rounded-full bg-white justify-center items-center mb-2"
            onPress={onPress}
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