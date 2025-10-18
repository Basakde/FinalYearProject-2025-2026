import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ClothingItemProps {
    name: string;
    iconName: string;
    color?: string;
    size?: number;
    onPress?: () => void;
}

const ClothingItem : React.FC<ClothingItemProps> = ({
    name,
    iconName,
    onPress,
}) => {
    const icons = {
        tshirt: require("../assets/images/ClothingIcons/t-shirt.png"),
        jeans: require("../assets/images/ClothingIcons/jeans.png"),
        sneakers: require("../assets/images/ClothingIcons/sneakers.png"),
        sundress: require("../assets/images/ClothingIcons/sundress.png"),
        sunglasses: require("../assets/images/ClothingIcons/sunglasses.png"),
        jacket: require("../assets/images/ClothingIcons/jacket.png"),
        all: require("../assets/images/ClothingIcons/all.png"),
        skirts: require("../assets/images/ClothingIcons/skirts.png"),
    };

    
    return (
        <TouchableOpacity className="p-3 border-b border-gray-200" onPress={onPress}>
            <View className="rounded-full bg-gray-200 w-16 h-16 mb-2 justify-center items-center">
                <Image 
                    source={icons[iconName as keyof typeof icons]}
                    style={{ width: 50, height: 50}}             
                />
            </View>
             <View className="m-1 justify-center items-center">
                 <Text>{name}</Text>
            </View>
           
        </TouchableOpacity>
    );
}

export default ClothingItem;