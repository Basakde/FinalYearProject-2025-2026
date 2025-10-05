import { Tabs } from 'expo-router';
import './global.css';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ headerShown: false }} />   
    </Tabs>
  );
}

