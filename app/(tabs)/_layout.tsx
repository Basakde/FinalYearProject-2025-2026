import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import './global.css';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
    </Tabs>
  );
}

