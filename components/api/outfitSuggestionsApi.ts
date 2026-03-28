import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/supabaseConfig";

export type GetOutfitSuggestionsPayload = {
	user_id: string;
	lat: number;
	lon: number;
	master_occasion_id?: string | number | null;
};

export const getOutfitSuggestions = async (payload: GetOutfitSuggestionsPayload) => {
	const res = await authFetch(`${FASTAPI_URL}/outfitSuggestions/get_outfit_suggestions`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const msg = await res.text();
		throw new Error(msg || "Failed to load outfit suggestions");
	}

	return res.json();
};
