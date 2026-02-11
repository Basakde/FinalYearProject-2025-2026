import { FASTAPI_URL } from "@/IP_Config";

const base = FASTAPI_URL;

export async function fetchUserColors(userId: string, activeOnly: boolean) {
  const url = `${base}/attributes/colors/user/${userId}?active_only=${activeOnly ? "true" : "false"}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.colors as { id: string; name: string; is_active: boolean }[];
}

export async function fetchColorOptions(userId: string) {
  const res = await fetch(`${base}/attributes/colors/options/user/${userId}?active_only=true`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.options as {
    id: string;
    name: string;
    source: "master" | "user";
    mapped_to: null | { id: string; name: string };
  }[];
}

export const NAME_TO_HEX: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  blue: "#0000ff",
  green: "#00ff00",
  yellow: "#ffff00",
  pink: "#ffc0cb",
  purple: "#800080",
  brown: "#8b4513",
  beige: "#f5f5dc",
  grey: "#808080",
  turquoise: "#40e0d0",
  navy: "#000080",
  orange: "#ffa500",
  mustard: "#c5a73c",
  burgundy: "#80132c",
};
