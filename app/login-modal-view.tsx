import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [name, setName]=useState("");
    const [password, setPassword]=useState("");
    const router= useRouter();
    //const onPress = () =>
  
  return (
    <SafeAreaProvider>
      <SafeAreaView className='bg-red-50 h-screen items-center '>
            <Image  
            source={require("../assets/images/wave.png")}
            className='w-full'
            resizeMode='cover'>
            </Image>
            <Text className='font-serif text-4xl mt-0'>Login</Text>
            <View className='flex bg-red-100 w-72 h-72 rounded-xl justify-center items-center'>
                <Text className=' font-mono p-5 text-2xl'>Username</Text>
                <TextInput 
                    className='bg-white h-54 w-64 p-3 rounded-xl'
                    placeholder='Enter your name'
                    maxLength={20}
                    onChangeText={text => setName(text)}
                />
                <Text className='p-5 font-mono text-2xl'>Password</Text>
                <TextInput
                    className='bg-white md:w-32 lg:w-48 p-3 h-54 w-64 rounded-xl'
                    placeholder='Enter your name'
                    maxLength={15}
                    onChangeText={text => setName(text)}
                />
                <Link href = "/register-modal-view" className='justify-center items-center'
                asChild>
                    <Pressable>
                        <Text className='text-blue-500 mt-4 font-mono'>Sign up?</Text>
                    </Pressable>
                </Link>

                <TouchableOpacity className='w-16 h-8 m-5 bg-red-300 text-white rounded-xl justify-center items-center'>
                    <Text>
                         Sign in 
                    </Text>  
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    </SafeAreaProvider>
    );
}