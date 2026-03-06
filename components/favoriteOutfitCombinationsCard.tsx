import { View, Image } from "react-native";

const POS = { TOP: 0, BOTTOM: 1, SHOES: 2, OUTER: 3 } as const;

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

function ImgSlot({ uri, h }: { uri?: string | null; h: number }) {
  return (
    <View style={{ height: h }} className="w-full bg-[#F3F3F3] overflow-hidden rounded-[6px]">
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"   // full clothing visible
        />
      ) : null}
    </View>
  );
}

export function OutfitSuggestionMiniCard({
  outfit,
  tileW,
  tileH,
}: {
  outfit: any;
  tileW: number;
  tileH: number;
}) {
  const itemsArr = ensureArray(outfit?.items);

  const top = pick(itemsArr, POS.TOP);
  const bottom = pick(itemsArr, POS.BOTTOM);
  const shoes = pick(itemsArr, POS.SHOES);
  const jacket = pick(itemsArr, POS.OUTER);

  const gap = 6;

  // allocate heights like suggestions:
  // jacket (optional) small, top big, bottom big, shoes medium
  const hasJacket = !!jacket?.image_url;
  const jacketH = hasJacket ? Math.round(tileH * 0.18) : 0;
  const shoesH = Math.round(tileH * 0.20);

  const remaining = tileH - jacketH - shoesH - gap * (hasJacket ? 3 : 2);
  const topH = Math.round(remaining * 0.52);
  const bottomH = remaining - topH;

  return (
    <View style={{ width: tileW }}>
      {hasJacket ? (
        <View style={{ marginBottom: gap }}>
          <ImgSlot uri={jacket.image_url} h={jacketH} />
        </View>
      ) : null}

      <View style={{ marginBottom: gap }}>
        <ImgSlot uri={top?.image_url} h={topH} />
      </View>

      <View style={{ marginBottom: gap }}>
        <ImgSlot uri={bottom?.image_url} h={bottomH} />
      </View>

      <ImgSlot uri={shoes?.image_url} h={shoesH} />
    </View>
  );
}