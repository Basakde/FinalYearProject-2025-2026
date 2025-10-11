import React from 'react';
import { Alert, Image, Linking, Text, TouchableOpacity } from 'react-native';

interface WebBrowserButtonProps {
  url?: string;
  label?: string;
}

const WebBrowserButton: React.FC<WebBrowserButtonProps> = ({
  url = 'https://www.google.co',
}) => {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Can't open the URL:", url);
    }
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
