import { FASTAPI_URL } from "@/IP_Config";

export async function fetchUserMaterials(userId: string, activeOnly: boolean) {
  const base = FASTAPI_URL;
  const url = `${base}/attributes/materials/user/${userId}?active_only=${activeOnly ? "true" : "false"}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.materials as { id: string; name: string; is_active: boolean }[];
}

export async function fetchMaterialOptions(userId: string) {
  const base = FASTAPI_URL;
  const res = await fetch(`${base}/attributes/materials/options/user/${userId}?active_only=true`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.options as {
    id: string;
    name: string;
    source: "master" | "user";
    mapped_to: null | { id: string; name: string };
  }[];
}