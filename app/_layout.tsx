import { ImageProvider } from '@/context/ImageContext';
import { Stack } from 'expo-router';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ImageProvider>
      <Stack>
        <Stack.Screen name="login-modal-view" />      
        <Stack.Screen name="register-modal-view" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="image-gallery" options={{ headerShown: false }} />
        <Stack.Screen name="image-view-modal" options={{ headerShown: false }} />      
      </Stack>
    </ImageProvider>
  );
}
