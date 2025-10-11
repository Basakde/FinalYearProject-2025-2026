import React from "react";
import { Image, Text, View } from "react-native";

interface ClothingItemProps {
    name: string;
    iconName: string;
    color?: string;
    size?: number;
}

const ClothingItem : React.FC<ClothingItemProps> = ({
    name,
    iconName,
}) => {
    const icons = {
        tshirt: require("../assets/images/ClothingIcons/t-shirt.png"),
        jeans: require("../assets/images/ClothingIcons/jeans.png"),
        sneakers: require("../assets/images/ClothingIcons/sneakers.png"),
        sundress: require("../assets/images/ClothingIcons/sundress.png"),
        sunglasses: require("../assets/images/ClothingIcons/sunglasses.png"),
        jacket: require("../assets/images/ClothingIcons/jacket.png"),
    };

    
    return (
        <View className="p-4 border-b border-gray-200">
            <View className="rounded-full bg-gray-200 w-16 h-16 mb-2 justify-center items-center">
                <Image 
                    source={icons[iconName as keyof typeof icons]}
                    style={{ width: 50, height: 50}}             
                />
            </View>
            <Text>{name}</Text>
        </View>
    );
}

export default ClothingItem;