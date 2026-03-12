import { FASTAPI_URL } from "@/IP_Config";


export async function fetchOccasionOptions() {
  const base = FASTAPI_URL;
  const res = await fetch(`${base}/attributes/occasions/options/?active_only=true`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.options as {
    id: string;
    name: string;
    source: "master" ;
  }[];
}