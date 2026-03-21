import React, { useRef, useState } from "react";
import { Animated, Image, TouchableOpacity, View } from "react-native";
import OpenCameraButton from "./openCameraButton";
import OpenGalleryButton from "./openGalleryButton";
import WebBrowserButton from "./webBrowserButton";

interface FloatingButtonProps {
  onPress?: () => void;
  onSelectAction?: (action: "camera" | "gallery" | "web") => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress, onSelectAction }) => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();

    setOpen(!open);
  };

  const buttonStyle = (offset: number) => ({
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -offset],
        }),
      },
    ],
    opacity: animation,
  });

  return (
    <View
      className="absolute bottom-10 right-5 items-center"
      style={{ zIndex: 999, elevation: 999 }}
    >
      <Animated.View style={buttonStyle(70)} className="absolute">
        <WebBrowserButton />
      </Animated.View>

      <Animated.View style={buttonStyle(140)} className="absolute">
        <OpenCameraButton onPress={() => onSelectAction?.("camera")} />
      </Animated.View>

      <Animated.View style={buttonStyle(210)} className="absolute">
        <OpenGalleryButton onPress={() =>onSelectAction?.("gallery")} />
      </Animated.View>

      <TouchableOpacity
        onPress={() => {
          toggleMenu();
          onPress?.();
        }}
        activeOpacity={0.8}
      >
        <View className="bg-[#fbf7f4] w-12 h-12 rounded-full justify-center items-center shadow-lg">
          <Image
            source={require("../assets/images/plus.png")}
            style={{ width: 24, height: 24 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingButton;

/*
  --------------------------------------------------------
  Image Attribution 
  --------------------------------------------------------
  The following images/icons used in this project are from Flaticon:
    - chrome.png <a href="https://www.flaticon.com/free-icons/chrome" title="chrome icons">Chrome icons created by Pixel perfect - Flaticon</a>
    - camera.png <a href="https://www.flaticon.com/free-icons/camera" title="camera icons">Camera icons created by Uniconlabs - Flaticon</a>
    - gallery.png <a href="https://www.flaticon.com/free-icons/gallery" title="gallery icons">Gallery icons created by ViconsDesign - Flaticon</a>
    - plus.png <a href="https://www.flaticon.com/free-icons/plus" title="plus icons">Plus icons created by HAJICON - Flaticon</a>
  Source: https://www.flaticon.com/
  License: Free to use with attribution
  --------------------------------------------------------
*/