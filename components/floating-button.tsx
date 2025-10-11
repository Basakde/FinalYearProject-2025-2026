import React, { useRef, useState } from 'react';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';

interface FloatingButtonProps {
  onPress?: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  onPress 
}) => {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction:6,
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
    <View className="absolute bottom-10 right-5 items-center">
      
      {/* Camera Button */}
      <Animated.View style={buttonStyle(70)} className="absolute">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
          onPress={() => console.log('Chrome pressed')}
        >
          <Text className="text-white text-lg">
            <Image 
              source={require("../assets/images/chrome.png")}
              style={{ width: 30, height: 30}} 
            />
        </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Gallery Button */}
      <Animated.View style={buttonStyle(140)} className="absolute">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
          onPress={() => console.log('Camera pressed')}
        >
          <Text className="text-white text-lg">
            <Image 
              source={require("../assets/images/camera.png")}
              style={{ width: 30, height: 30}} 
            />
        </Text>
        </TouchableOpacity>
      </Animated.View>

     {/* Gallery Button */}
      <Animated.View style={buttonStyle(210)} className="absolute">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
          onPress={() => console.log('Gallery pressed')}
        >
          <Text className="text-white text-lg">
            <Image 
              source={require("../assets/images/gallery.png")}
              style={{ width: 30, height: 30}} 
            />
        </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main FAB */}
      <TouchableOpacity
        onPress={() => { toggleMenu(); onPress && onPress(); }}
        activeOpacity={0.8}
      >
        <View className="bg-gray-300 w-16 h-16 rounded-full justify-center items-center shadow-lg">
          <Text className="text-white text-3xl">
            <Image 
              source={require("../assets/images/plus.png")}
              style={{ width: 30, height: 30}} 
            />
          </Text>
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