import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from '../supabaseConfig';

export default function RegisterScreen(){

    const [password, setPassword]=useState("");
    const [email, setEmail]=useState("");
    const router= useRouter();


  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log('Registration failed', error.message);
    } else {
     console.log('Success', 'Account created successfully!');
      router.replace('/login-modal-view');
    }
  };


    return (
         <SafeAreaView className='flex-1 justify-content items-center bg-white' edges={['bottom']}>
         
            <ImageBackground 
                source={require("../assets/images/wave.png")}
                className='w-full h-64'
                resizeMode='cover'
                />
    
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                extraScrollHeight={20}
                enableOnAndroid={true}
                >
                    
                    <View className='bg-black w-72 p-10 rounded-xl m-3 items-center'>
                        <Text className='font-serif text-4xl mt-5 mb-2 text-white'>Register</Text>
                        <Text className='p-5 font-mono text-2xl text-white'>Email</Text>
                        <TextInput
                            className='bg-white md:w-32 lg:w-48 p-3 h-54 w-64 rounded-xl'
                            placeholder='Enter your emails'
                            onChangeText={email => setEmail(email)}
                            value={email}

                        />
                        <Text className='p-5 font-mono text-2xl text-white'>Password</Text>
                        <TextInput
                            className='bg-white md:w-32 lg:w-48 p-3 h-54 w-64 rounded-xl'
                            placeholder='Enter your password'
                            maxLength={15}
                            onChangeText={password=> setPassword(password)}
                            value={password}
                            secureTextEntry
                        />
                            <TouchableOpacity className='w-full bg-red-300 p-3 rounded-xl items-center' onPress={handleRegister}>
                            <Text className='text-white'>Register</Text>  
                        </TouchableOpacity>
                    </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}