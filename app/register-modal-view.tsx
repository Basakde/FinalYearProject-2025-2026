import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen(){

    const [name, setName]=useState("");
    const [password, setPassword]=useState("");
    const [email, setEmail]=useState("");
    const router= useRouter();

    return (
        <SafeAreaProvider>
            <SafeAreaView className='bg-red-50 h-screen items-center'>
                <Image  
                    source={require("../assets/images/wave.png")}
                    className='w-full'
                    resizeMode='cover'>
                </Image>
                <Text className='font-serif text-4xl mt-0'>Register</Text>
                <View className='flex bg-red-100 w-72 h-88 rounded-xl justify-center items-center'>
                    <Text className='p-5 font-mono text-2xl'>Email</Text>
                    <TextInput
                        className='bg-white md:w-32 lg:w-48 p-3 h-54 w-64 rounded-xl'
                        placeholder='Enter your emails'
                        maxLength={15}
                        onChangeText={email => setEmail(email)}
                    />
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
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )


}