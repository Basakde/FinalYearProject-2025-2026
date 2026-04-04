import React from "react";
import { Image, TouchableOpacity } from "react-native";

interface OpenGalleryButtonProps {
  onPress?: () => void;
}

const OpenGalleryButton: React.FC<OpenGalleryButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      className="w-14 h-14 rounded-full bg-white border border-[#E6E6E6] justify-center items-center mb-2"
      onPress={onPress}
    >
      <Image
        source={require("../assets/images/gallery.png")}
        style={{ width: 30, height: 30 }}
      />
    </TouchableOpacity>
  );
};

export default OpenGalleryButton;






