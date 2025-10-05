import LoginScreen from '@/app/login-modal-view';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';


export default function IndexScreen() {
  return (
    <SafeAreaProvider>
        <LoginScreen />
    </SafeAreaProvider>
  );
}
