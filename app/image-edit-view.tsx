import { useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";

interface ImageEditProps {
    //imageUri: string;
    style?: object;
}

const ImageViewModal: React.FC<ImageEditProps> = ({
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