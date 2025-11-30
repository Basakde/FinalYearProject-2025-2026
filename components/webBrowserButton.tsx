import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';

interface WebBrowserButtonProps {
  url?: string;
  label?: string;
}

const WebBrowserButton: React.FC<WebBrowserButtonProps> = ({
  url = 'https://www.google.com',//DEFAULT URL
}) => {
  const router=useRouter();

  const handlePress = async () => {
    router.push({
      pathname: "/web-browsing-view",
      params: { url },
    });
  };

  return (
    <TouchableOpacity
      className="w-14 h-14 rounded-full bg-gray-300 justify-center items-center mb-2"
      onPress={handlePress}
    >
        <Text className="text-white text-lg">
            <Image 
                source={require("../assets/images/chrome.png")}
                style={{ width: 30, height: 30}} 
            />
        </Text>
    </TouchableOpacity>
  );
};

export default WebBrowserButton;
