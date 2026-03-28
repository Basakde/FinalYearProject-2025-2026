import * as ImagePicker from "expo-image-picker";

export async function pickGalleryImages() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "livePhotos"],
    allowsMultipleSelection: true,
    quality: 1,
  });

  return result;
}