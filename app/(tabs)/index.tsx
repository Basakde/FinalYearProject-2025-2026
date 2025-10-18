import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from '../login-modal-view';
import './global.css';


export default function IndexScreen() {
  return (
    <SafeAreaProvider>
        <LoginScreen />
    </SafeAreaProvider>
  );
}
