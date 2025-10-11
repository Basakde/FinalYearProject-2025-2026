import ClothingItem from "@/components/clothing-item";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {

    const clothingIcons = [
        { name: 'Tops', iconName: 'tshirt' },
        { name: 'Bottoms', iconName: 'jeans' },
        { name: 'Dresses', iconName: 'sundress' },
        { name: 'Outerwear', iconName: 'jacket' },
        { name: 'Footwear', iconName: 'sneakers' },
        { name: 'Accessories', iconName: 'sunglasses' },
    ];
    return(
        <SafeAreaView className='flex-1 bg-slate-100' edges={['bottom']}>
            <ScrollView className="m-5">
                <View className=" ">
                    <Text>Welcome to first page</Text>
                    <ScrollView horizontal={true}>
                        {clothingIcons.map((item,index) => (
                                <View className="flex-row">
                                    <ClothingItem key={index} name={item.name} iconName={item.iconName} />
                                </View>
                                ))}
                    </ScrollView>
                </View>
             </ScrollView>
                <View>
                    <Text>Home Screen</Text>
                </View>
           
        </SafeAreaView>

    );
}