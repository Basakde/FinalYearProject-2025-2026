import BackButton from "@/components/backButton";
import OutfitSlider from "@/components/outfitSlider";
import { useAuth } from "@/context/AuthContext";
import { categories, WardrobeItem } from "@/types/items";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";



export default function PickOutfit() {
  const { user } = useAuth();
  const FASTAPI_URL = "http://192.168.0.12:8000";

    const [tops, setTops] = useState<WardrobeItem[]>([]);
    const [bottoms, setBottoms] = useState<WardrobeItem[]>([]);
    const [shoes, setShoes] = useState<WardrobeItem[]>([]); 

    const [topIndex, setTopIndex] = useState<number>(0);
    const [bottomIndex, setBottomIndex] = useState<number>(0);
    const [shoesIndex, setShoesIndex] = useState<number>(0);


  const fetchItems = async () => {
    const res = await fetch(`${FASTAPI_URL}/items/${user.id}`);
    const data = await res.json();
    const all: WardrobeItem[] = data.items ?? [];

    setTops(all.filter(i => i.category_id === categories.Top));
    setBottoms(all.filter(i => i.category_id === categories.Bottom));
    setShoes(all.filter(i => i.category_id === categories.Shoes));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <ScrollView className="flex-1">
       <BackButton />
      <Text className="text-2xl font-extrabold text-center text-[#6C9A8B] mt-25 mb-5">
        Pick Your Outfit
      </Text>

      <OutfitSlider
        items={tops}
        index={topIndex}
        onChange={setTopIndex}
      />

      <OutfitSlider
        items={bottoms}
        index={bottomIndex}
        onChange={setBottomIndex}
      />

      <OutfitSlider
        items={shoes}
        index={shoesIndex}
        onChange={setShoesIndex}
      />
    </ScrollView>
  );
}
