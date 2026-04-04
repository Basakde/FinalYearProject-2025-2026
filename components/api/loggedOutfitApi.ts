import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";

type LoggedOutfitField = string | number | null;

export type CreateLoggedOutfitPayload = {
  user_id: string;
  outfit_id?: LoggedOutfitField;
  type?: string | null;
  top_id?: LoggedOutfitField;
  bottom_id?: LoggedOutfitField;
  shoes_id?: LoggedOutfitField;
  outerwear_id?: LoggedOutfitField;
  jumpsuit_id?: LoggedOutfitField;
  master_occasion_id?: LoggedOutfitField;
  name?: string | null;
  worn_at?: string | null;
};

export const createLoggedOutfit = async (payload: CreateLoggedOutfitPayload) => {
  const res = await authFetch(`${FASTAPI_URL}/logged_outfits/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      outfit_id: null,
      name: null,
      ...payload,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to log outfit");
  }

  return data;
};