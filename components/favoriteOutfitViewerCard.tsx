import { Image, Text, View } from "react-native";
import DeleteButton from "./deleteButton";
import OutfitRow from "./outfitRow";

const POS = {
  OUTER: 0,
  TOP: 1,
  BOTTOM: 2,
  SHOES: 3,
  JUMPSUIT: 4,
  ACCESSORY: 5,
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
  const accessory = pick(itemsArr, POS.ACCESSORY);
  

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

                          
        {(() => {
          const hasOuter = !!outerwear;

          // count how many rows actually have an image
          const slots = jumpsuit
            ? [jumpsuit, shoes].filter(Boolean)
            : [top, bottom, shoes].filter(Boolean);
          const rowCount = slots.length + (hasOuter ? 1 : 0);

          // divide available height equally among present rows
          // give a boost when 4+ rows so items aren't too small
          const baseH = rowCount >= 4 ? cardH * 1.25 : cardH;
          const rowH = rowCount > 0 ? baseH / rowCount : cardH * 0.35;
          const outerH = hasOuter ? rowH : 0;
          const totalH = rowCount * rowH;

          return (
            <View style={{ height: totalH }} className="justify-start">
              {outerwear && (
                <OutfitRow
                  label="OUTERWEAR"
                  uri={outerwear.image_url}
                  maxH={outerH}
                />
              )}
              {jumpsuit ? (
                <>
                  <OutfitRow label="JUMPSUIT" uri={jumpsuit.image_url} maxH={rowH} />
                  <OutfitRow label="SHOES" uri={shoes?.image_url} maxH={rowH} />
                </>
              ) : (
                <>
                  <OutfitRow label="TOP" uri={top?.image_url} maxH={rowH} />
                  <OutfitRow label="BOTTOM" uri={bottom?.image_url} maxH={rowH} />
                  <OutfitRow label="SHOES" uri={shoes?.image_url} maxH={rowH} />
                </>
              )}
            </View>
          );
        })()}

        {accessory?.image_url && (
          <View className="absolute bottom-3 right-3 w-[64px] h-[64px] rounded-full bg-white border border-[#E6E6E6] overflow-hidden items-center justify-center">
            <Image
              source={{ uri: accessory.image_url }}
              resizeMode="cover"
              className="w-[56px] h-[56px] rounded-full"
            />
          </View>
        )}
    </View>
  );
}