import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabaseConfig';

export default function LoginScreen() {
  
  const [password, setPassword] = useState("");
  const [email, setEmail]=useState("");
  const router = useRouter();


  
 const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login failed', error.message);
    } else {
      console.log('User logged in:', data.user);
      router.replace('/(tabs)');
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
                

                <View className='bg-black w-72 p-10 rounded-xl m-10 items-center'>
                    <Text className='font-serif text-4xl mt-5 mb-5 text-white'>Login</Text>
                    <Text className='font-mono text-2xl mb-2 text-white'>Email</Text>
                    <TextInput 
                        className='bg-white w-full p-3 rounded-xl mb-4'
                        placeholder='Enter your name'
                        onChangeText={email => setEmail(email)}
                        value={email}
                    />

                    <Text className='font-mono text-2xl mb-2 text-white'>Password</Text>
                    <TextInput
                        className='bg-white w-full p-3 rounded-xl mb-4'
                        placeholder='Enter your password'
                        maxLength={15}
                        onChangeText={password => setPassword(password)}
                        value={password}
                        secureTextEntry
                    />

                    <Link href="/register-modal-view" asChild>
                        <Pressable>
                        <Text className='text-blue-500 mb-4'>Sign up?</Text>
                        </Pressable>
                    </Link>

                    <TouchableOpacity className='w-full bg-red-300 p-3 rounded-xl items-center' onPress={handleLogin}>
                        <Text className='text-white'>Sign in</Text>  
                    </TouchableOpacity>
                </View>
        </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}


