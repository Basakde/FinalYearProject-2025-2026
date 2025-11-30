import BackButton from "@/components/backButton";
import OutfitSlider from "@/components/outfitSlider";
import { useAuth } from "@/context/AuthContext";
import { categories, WardrobeItem } from "@/types/items";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PickOutfit() {
  const { user } = useAuth();
  const FASTAPI_URL = "http://192.168.0.12:8000";
  type CategoryKey = "tops" | "bottoms" | "shoes" | "jacket" | "accessory";

  const [tops, setTops] = useState<WardrobeItem[]>([]);
  const [bottoms, setBottoms] = useState<WardrobeItem[]>([]);
  const [shoes, setShoes] = useState<WardrobeItem[]>([]);
  const [jacket, setJacket] = useState<WardrobeItem[]>([]);
  const [accessory, setAccessory] = useState<WardrobeItem[]>([]);

  const [indexes, setIndexes] = useState<Record<CategoryKey, number>>({
  tops: 0,
  bottoms: 0,
  shoes: 0,
  jacket: 0,
  accessory: 0,
});


  const [pinned, setPinned] = useState<Record<CategoryKey, boolean>>({
  tops: false,
  bottoms: false,
  shoes: false,
  jacket: false,
  accessory: false,
});

  const [enabled, setEnabled] = useState<CategoryKey[]>(["tops", "bottoms", "shoes"]);

  //const accessoryEnabled = enabled.includes("accessory");

  const togglePin = (cat: CategoryKey) => {
    setPinned((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const shuffle = () => {
  setIndexes((prev) => {
    const updated = { ...prev };

    // Loop through each enabled category
    //Pin functionality has been removed for now
    for (const cat of enabled) {
      // If pinned → skip
      if (pinned[cat]) continue;

      // Get the array for that category
      const arr = getItems(cat);

      // If empty or undefined → skip
      if (!arr || arr.length === 0) continue;

      // Pick a random index
      const randomIndex = Math.floor(Math.random() * arr.length);

      updated[cat] = randomIndex;
    }

    return updated;
  });
};


const getItems = (cat: string) => {
  if (cat === "tops") return tops;
  if (cat === "bottoms") return bottoms;
  if (cat === "shoes") return shoes;
  if (cat === "jacket") return jacket;
  if (cat === "accessory") return accessory;
  return [];
};



  const addCategory = () => {
    const next = ["jacket", "accessory"].find((c) => !enabled.includes(c as CategoryKey)) as CategoryKey | undefined;
    if (next) setEnabled((prev) => [...prev, next]);
  };

  const fetchItems = async () => {
    const res = await fetch(`${FASTAPI_URL}/items/user/${user.id}`);
    const data = await res.json();
    const all: WardrobeItem[] = data.items ?? [];

    setTops(all.filter((i) => i.category_id === categories.Top));
    setBottoms(all.filter((i) => i.category_id === categories.Bottom));
    setShoes(all.filter((i) => i.category_id === categories.Shoes));
    setJacket(all.filter((i) => i.category_id === categories.Outerwear));
    setAccessory(all.filter((i) => i.category_id === categories.Accessory));
  };

    useFocusEffect(
      useCallback(() => {
        fetchItems();
      }, [])
    );

  const removeCategory = (cat: CategoryKey) => {
  setEnabled((prev) => prev.filter(c => c !== cat));
};


  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 pt-2 mt-10">
        <BackButton />

        <View className="flex-row justify-between items-center mt-5 mb-4">
          <Text className="text-2xl font-extrabold text-[#6C9A8B]">
            Pick an Outfit
          </Text>

          <View className="flex-row gap-4 mt-5">
            {/* SHUFFLE */}
            <TouchableOpacity onPress={shuffle}>
              <Ionicons name="shuffle" size={32} color="#6C9A8B" />
            </TouchableOpacity>

            {/* ADD CATEGORY */}
            <TouchableOpacity onPress={addCategory}>
              <Ionicons name="add-circle-outline" size={32} color="#6C9A8B" />
            </TouchableOpacity>
          </View>
        </View>
        <View
              className={`w-full ${
                enabled.includes("accessory")
                  ? "flex-row justify-between"
                  : "flex-col"
              }`}
            >
              {/* LEFT COLUMN */}
              <View
                className={
                  enabled.includes("accessory")
                    ? "flex-1 mr-2"
                    : "w-full"
                }
              >
                {enabled.includes("jacket") && (
                  <OutfitSlider
                    items={jacket}
                    index={indexes.jacket}
                    onChange={(i) => setIndexes({ ...indexes, jacket: i })}
                    pinned={pinned.jacket}
                    onTogglePin={() => togglePin("jacket")}
                    onRemove={() => removeCategory("jacket")}
                    orientation="horizontal"
                  />
                )}

                {enabled.includes("tops") && (
                  <OutfitSlider
                    items={tops}
                    index={indexes.tops}
                    onChange={(i) => setIndexes({ ...indexes, tops: i })}
                    pinned={pinned.tops}
                    onTogglePin={() => togglePin("tops")}
                    onRemove={() => removeCategory("tops")}
                    orientation="horizontal"
                  />
                )}

                {enabled.includes("bottoms") && (
                  <OutfitSlider
                    items={bottoms}
                    index={indexes.bottoms}
                    onChange={(i) => setIndexes({ ...indexes, bottoms: i })}
                    pinned={pinned.bottoms}
                    onTogglePin={() => togglePin("bottoms")}
                    onRemove={() => removeCategory("bottoms")}
                    orientation="horizontal"
                  />
                )}

                {enabled.includes("shoes") && (
                  <OutfitSlider
                    items={shoes}
                    index={indexes.shoes}
                    onChange={(i) => setIndexes({ ...indexes, shoes: i })}
                    pinned={pinned.shoes}
                    onTogglePin={() => togglePin("shoes")}
                    onRemove={() => removeCategory("shoes")}
                    orientation="horizontal"
                  />
                )}
              </View>

              {/* RIGHT COLUMN */}
              {enabled.includes("accessory") && (
                <View className="flex-none min-w-[170px] ml-2 items-center justify-center">
                  <OutfitSlider
                    items={accessory}
                    index={indexes.accessory}
                    onChange={(i) => setIndexes({ ...indexes, accessory: i })}
                    pinned={pinned.accessory}
                    onTogglePin={() => togglePin("accessory")}
                    onRemove={() => removeCategory("accessory")}
                    orientation="vertical"
                  />
                </View>
              )}
            </View>
      </ScrollView>
    </View>
  );
}
