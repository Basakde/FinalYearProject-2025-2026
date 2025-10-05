import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen(){

    const [name, setName]=useState("");
    const [password, setPassword]=useState("");
    const [email, setEmail]=useState("");
    const router= useRouter();

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
                                maxLength={15}
                                onChangeText={email => setEmail(email)}
                                value={email}

                            />
                            <Text className=' font-mono p-5 text-2xl text-white'>Username</Text>
                            <TextInput 
                                className='bg-white h-54 w-64 p-3 rounded-xl'
                                placeholder='Enter your name'
                                maxLength={20}
                                onChangeText={text => setName(text)}
                            />
                            <Text className='p-5 font-mono text-2xl text-white'>Password</Text>
                            <TextInput
                                className='bg-white md:w-32 lg:w-48 p-3 h-54 w-64 rounded-xl'
                                placeholder='Enter your password'
                                maxLength={15}
                                onChangeText={text => setName(text)}
                                value={password}
                                secureTextEntry
                            />
                    </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}