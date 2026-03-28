import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/supabaseConfig";

export type OutfitPreference = "like" | "dislike";

export type SetOutfitPreferencePayload = {
	user_id: string;
	preference: OutfitPreference;
	outfit_id?: string | null;
	item_ids: Array<string | number>;
};

export const setOutfitPreference = async (payload: SetOutfitPreferencePayload) => {
	const res = await authFetch(`${FASTAPI_URL}/preferences/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data?.detail || "Failed to save outfit preference");
	}

	return data;
};
