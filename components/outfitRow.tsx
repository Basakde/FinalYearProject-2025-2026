import { Image, View } from "react-native";

export default function OutfitRow({
  label,
  uri,
  maxH,
}: {
  label: string;
  uri?: string;
  maxH: number;
}) {
  if (!uri) return null;

  // tune per slot
  const scale =
    label === "SHOES" ? 1.32 :
    label === "BOTTOM" ? 1.9 :
    label === "TOP" ? 1.9 :
    label === "OUTERWEAR" ? 1.9 : 
    label === "JUMPSUIT" ? 1.6: 1; // default fallback

  const widthPct =
    label === "SHOES" ? "70%" : "82%"; // shoes narrower so they don't crop

  return (
    <View 
      style={{
        height: maxH,
        width: "100%",
        overflow: "hidden",     
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <Image
        source={{ uri }}
        resizeMode="contain"
        style={{
          width: widthPct,
          height: "100%",
          transform: [{ scale }],
        }}
      />
    </View>
  );
}
