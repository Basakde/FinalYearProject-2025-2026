import { HapticTab } from '@/components/haptic-tab';
import { Tabs } from 'expo-router';
import './global.css';

export default function TabLayout() {
  return (
    <Tabs
       screenOptions={{
        tabBarActiveTintColor: '#e91e63',
        tabBarStyle: { backgroundColor: '#f0f0f0' }, 
        tabBarLabelStyle: { fontSize: 12 },
        tabBarButton:HapticTab
       }}>
      <Tabs.Screen name="index" options={{ headerShown: false,title:'Home' }} />  
      <Tabs.Screen name="placeholderOne" options={{ headerShown: false,title:'PH1' }} />  
    </Tabs>
  );
}

