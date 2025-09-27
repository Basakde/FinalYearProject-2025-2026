import React from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './global.css';


export default function HomeScreen() {

  
  return (
    <SafeAreaProvider>
      <SafeAreaView className='bg-red-50 h-screen items-center '>
        <Image  
          source={require("../../assets/images/wave.png")}
          className='w-full'
          resizeMode='cover'>
        </Image>
        <Text className='font-serif text-4xl mt-0'>Login</Text>
        <View className='bg-red-100 w-72 h-72 rounded-xl justify-center items-center'>
          <Text className=' font-mono p-5 text-2xl'>Username</Text>
          <TextInput 
            className='bg-black p-5 h-4 w-52 rounded-xl text-white'
            placeholder='Enter your name'
            maxLength={20}
          />
          <Text className='p-5 font-mono text-2xl'>Password</Text>
          <TextInput
            className='bg-black p-5 h-4 w-52 rounded-xl text-white'
            placeholder='Enter your name'
            maxLength={15}
          />
          <Text 
          className='text-blue-500 mt-4 font-mono'>
            Sign up?
          </Text>
        </View>
        </SafeAreaView>
      </SafeAreaProvider>
  );
}
