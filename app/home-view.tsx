import ClothingItem from "@/components/clothing-item";
import FloatingButton from "@/components/floating-button";
import SearchBar from "@/components/search-bar";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {

    const clothingIcons = [
        { name: 'All', iconName: 'all' },
        { name: 'Tops', iconName: 'tshirt' },
        { name: 'Bottoms', iconName: 'jeans' },
        { name: 'Dresses', iconName: 'sundress' },
        { name: 'Skirts', iconName: 'skirts' },
        { name: 'Outerwear', iconName: 'jacket' },
        { name: 'Footwear', iconName: 'sneakers' },
        { name: 'Accessories', iconName: 'sunglasses' },
    ];
    return(
        <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
            <ScrollView className="m-5">
                <View className=" ">
                    <ScrollView horizontal={true}>
                        {clothingIcons.map((item, index) => (
                            <View className="flex-row" key={item.name ?? index}>
                                <ClothingItem name={item.name} iconName={item.iconName} />
                            </View>
                        ))}
                    </ScrollView>
                    <View className="mt-4">
                        <SearchBar clearButtonMode="always" placeholder="Search by name" />
                    </View>
                </View>
            </ScrollView>
            <FloatingButton />
        </SafeAreaView>

    );
}