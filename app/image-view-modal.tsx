import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

interface imageViewModalProps {
    //imageUri: string;
    style?: object;
}

const ImageViewModal: React.FC<imageViewModalProps> = ({
    //imageUri,
    style={width: '100%', height: '100%'},
}) => {
     const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

    return (
        <View>
            <Image source={{ uri: imageUri }} style={style} />
        </View>
    );
};


export default ImageViewModal;