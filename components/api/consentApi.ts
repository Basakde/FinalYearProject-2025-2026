import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";


export async function getMyConsent() {
  const res = await authFetch(`${FASTAPI_URL}/consent/`);

  if (!res.ok) {
    throw new Error("Failed to load consent");
  }

  return res.json();
}

export async function updateMyConsent() {
  const res = await authFetch(`${FASTAPI_URL}/consent/`, {
    method: "PATCH",
    body: JSON.stringify({
      gdpr_consent: true
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update consent");
  }

  return res.json();
}