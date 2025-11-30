import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Page {
  title: string;
  content: string;
}

export default function NewspaperScreen() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);

  //const FASTAPI_URL = "http://192.168.0.12:8000";
  const { width, height } = Dimensions.get("window");

  /*const fetchNewspaper = async () => {
    try {
      const res = await fetch(`${FASTAPI_URL}/newspaper`);
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err) {
      console.log("Newspaper fetch error", err);
    }
  };

  useEffect(() => {
    fetchNewspaper();
  }, []);*/

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 pb-4">

            {/* HEADER */}
            <Text className="text-3xl text-[#E8998D] font-extrabold text-center mb-6">
            WardorAI Daily
            </Text>

            <View className="mt-6 w-[88%] self-center bg-[#faf7f0] border border-[#e4d9c3] rounded-2xl shadow p-5">
            
            {/* Title */}
            <Text className="text-2xl font-extrabold text-[#E8998D] text-center">
                WardorAI Daily 📰
            </Text>

            {/* Subtitle */}
            <Text className="mt-1 text-center text-[#6C9A8B] font-semibold">
                Sustainable Fashion News
            </Text>

            {/* Divider */}
            <View className="mt-3 mb-4 h-[1px] bg-[#e4d9c3] w-full" />

            {/* Body placeholder */}
            <Text className="text-base text-[#4a3f35] leading-6 text-center">
                Your personalized eco-fashion newspaper is on its way!  
                Stay tuned for daily insights on sustainability,  
                conscious shopping, and mindful wardrobe curation.
            </Text>

            {/* Footer */}
            <Text className="text-xs text-center text-[#A1683A] mt-4 opacity-60">
                Feature coming soon...
            </Text>
            </View>
        


        {/* CLOSE BUTTON */}
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-lg font-bold text-center text-[#E8998D]">
            Close Newspaper ✖
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
