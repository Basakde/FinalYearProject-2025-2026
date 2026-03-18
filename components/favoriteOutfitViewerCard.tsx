import { Text, View } from "react-native";
import DeleteButton from "./deleteButton";
import OutfitRow from "./outfitRow";

const POS = {
  OUTER: 0,
  TOP: 1,
  BOTTOM: 2,
  SHOES: 3,
  JUMPSUIT: 4,
} as const;

function ensureArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function pick(items: any[], position: number) {
  return items.find((x) => Number(x.position) === position) ?? null;
}


export function FavoriteOutfitViewerCard({
  outfit,
  cardH,
  onDelete,
}: {
  outfit: any;
  cardH: number;
  onDelete: () => void;
}) {
  const itemsArr = ensureArray(outfit?.items);
  const outerwear = pick(itemsArr, POS.OUTER);
  const top = pick(itemsArr, POS.TOP);
  const bottom = pick(itemsArr, POS.BOTTOM);
  const shoes = pick(itemsArr, POS.SHOES);
  const jumpsuit = pick(itemsArr, POS.JUMPSUIT);
  console.log("Rendering outfit card with items:", { outerwear,top, bottom, shoes, jumpsuit });

  return (
    <View className="bg-[#F7F7F7] overflow-hidden rounded-[6px] px-4 pt-4 pb-4">
      <View className="flex-row items-start justify-between mb-2">
          <DeleteButton
                onPress={onDelete}
                variant="filled"
                shape="circle"
                size="sm"
                className="absolute top-2 right-2"
              /> 

              <View>
                <Text className="text-[10px] tracking-[1.5px] text-[#111] border border-[#E6E6E6] bg-white px-2 py-1 mb-2 w-max">
                  {(outfit?.occasion_name ?? "ANY OCCASION").toUpperCase()}
                </Text>
              </View>
            </View>

                          
        {outerwear && (
            <OutfitRow
            label="OUTERWEAR"
            uri={outerwear.image_url}
            maxH={cardH * 0.30}
            />
        )}

        <View style={{ height: cardH }} className="justify-start">
            {jumpsuit ? (
            <>
                <OutfitRow label="JUMPSUIT" uri={jumpsuit.image_url} maxH={cardH * 0.50} />
                <OutfitRow label="SHOES" uri={shoes?.image_url} maxH={cardH * 0.40} />
            </>
            ) : (
            <>
                <OutfitRow label="TOP" uri={top?.image_url} maxH={cardH * 0.30} />
                <OutfitRow label="BOTTOM" uri={bottom?.image_url} maxH={cardH * 0.35} />
                <OutfitRow label="SHOES" uri={shoes?.image_url} maxH={cardH * 0.35} />
            </>
            )}
        </View>
    </View>
  );
}