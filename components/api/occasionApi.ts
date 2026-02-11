import { FASTAPI_URL } from "@/IP_Config";

export async function fetchUserOccasions(userId: string, activeOnly: boolean) {
  const base = FASTAPI_URL;
  const url = `${base}/attributes/occasions/user/${userId}?active_only=${activeOnly ? "true" : "false"}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.occasions as { id: string; name: string; is_active: boolean }[];
}

export async function fetchOccasionOptions(userId: string) {
  const base = FASTAPI_URL;
  const res = await fetch(`${base}/attributes/occasions/options/user/${userId}?active_only=true`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.options as {
    id: string;
    name: string;
    source: "master" | "user";
    mapped_to: null | { id: string; name: string };
  }[];
}