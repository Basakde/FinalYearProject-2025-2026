import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Button, Text, TouchableOpacity, View } from "react-native";
import { useImages } from "../context/ImageContext"; // ✅ import your global gallery context

export default function CameraScreen() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { addImages } = useImages();
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-content">
        <Text className="text-white">We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  // 📸 Capture photo and add to Mini Gallery
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        addImages(photo.uri); // add to your global gallery
        Alert.alert("Saved!", "Image added to your gallery view.");
        router.replace("/image-gallery-view"); // navigate back to mini gallery
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 , backgroundColor: 'transparent'}} facing={facing}  />

      <View className="w-screen items-center justify-content flex-row">
        <TouchableOpacity className="items-center justify-content mx-10 border-2 w-24 h-8 my-10" onPress={toggleCameraFacing}>
          <Text className="text-black">Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center mx-10 my-10 border-2 w-24 h-8" onPress={takePicture}>
          <Text className="text-white">📸</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


 