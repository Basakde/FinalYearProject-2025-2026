import LoginScreen from '@/app/login-modal-view';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './global.css';


export default function IndexScreen() {

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <LoginScreen />
        </SafeAreaView>
      </SafeAreaProvider>
  );
}
