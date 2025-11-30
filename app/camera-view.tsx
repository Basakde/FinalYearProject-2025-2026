import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Button, Text, TouchableOpacity, View } from "react-native";
import { useImages } from "../context/ImageContext";

export default function CameraScreen() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { addImages } = useImages();
  const router = useRouter();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ //acces camera to take picture
        quality: 1,//full resolution
        skipProcessing: true,// faster capture, no internal processing
      });

      if (!photo) return;

      addImages(photo.uri);
      Alert.alert("Saved!", "Image added to your gallery.");

      router.replace("/image-gallery-view");
    } catch (err) {
      console.error("Error taking picture:", err);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      />

      <View className="absolute bottom-10 w-full flex-row justify-evenly items-center px-4">
        <TouchableOpacity className="border border-white rounded-xl px-4 py-2" onPress={() => setFacing(facing === "back" ? "front" : "back")}>
          <Text className="text-white">Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity className="border border-white rounded-full w-16 h-16 justify-center items-center" onPress={takePicture}>
          <Text className="text-white text-lg">📸</Text>
        </TouchableOpacity>

        <TouchableOpacity className="border border-white rounded-xl px-4 py-2" onPress={() => router.back()}>
          <Text className="text-white">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
