import React from "react";
import { Image, TouchableOpacity } from "react-native";

interface OpenCameraButtonProps {
  onPress?: () => void;
}

const OpenCameraButton: React.FC<OpenCameraButtonProps> = ({ onPress }) => {

    return (
        <TouchableOpacity
            className="w-14 h-14 rounded-full bg-white border border-[#E6E6E6] items-center justify-center"
            onPress={onPress}
        >
            <Image
                source={require("../assets/images/camera.png")}
                style={{ width: 30, height: 30 }}
            />
        </TouchableOpacity>
    );
};
export default OpenCameraButton;