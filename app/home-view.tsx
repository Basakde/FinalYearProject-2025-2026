import ClothingItem from "@/components/clothing-item";
import FloatingButton from "@/components/floating-button";
import SearchBar from "@/components/search-bar";
import { FlatList, Image, ScrollView, View } from "react-native";
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

    const sampleImages = [
        { id: "1", source:require( "../assets/images/ExampleClothingDataset/1.jpg" )},
        { id: "2", source:require( "../assets/images/ExampleClothingDataset/2.jpg" )},
        { id: "3", source:require( "../assets/images/ExampleClothingDataset/3.jpg" )},
        { id: "4", source:require( "../assets/images/ExampleClothingDataset/4.jpg" )},
        { id: "5", source:require( "../assets/images/ExampleClothingDataset/5.jpg" )},
        { id: "6", source:require( "../assets/images/ExampleClothingDataset/6.jpg" )},
        { id: "7", source:require( "../assets/images/ExampleClothingDataset/7.jpg" )},
        { id: "8", source:require( "../assets/images/ExampleClothingDataset/8.jpg" )},
        { id: "9", source:require( "../assets/images/ExampleClothingDataset/9.jpg" )},
        { id: "10", source:require( "../assets/images/ExampleClothingDataset/10.jpg" )},
        { id: "11", source:require( "../assets/images/ExampleClothingDataset/11.jpg" )},
        { id: "12", source:require( "../assets/images/ExampleClothingDataset/11.jpg" )},
        ];
    return(
        <SafeAreaView className='flex-1 bg-white' edges={['bottom']}>
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
            <FlatList
                data={sampleImages}
                keyExtractor={(item) => item.id}
                numColumns={4} // 3 images per row
                renderItem={({ item }) => (
                    <View className="flex-1 justify-content items-center m-3">
                        <Image
                            source={ item.source}
                                className="w-32 h-32 p-3"
                                resizeMode="contain"
                        />
                    </View>
                )}
            />
           <FloatingButton />
        </SafeAreaView>

    );
}
