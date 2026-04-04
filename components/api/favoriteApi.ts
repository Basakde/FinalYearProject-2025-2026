import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";

export type CreateFavoritePayload = {
	outfit_id?: string | null;
	item_ids: Array<string | number | null>;
	master_occasion_id?: string | number | null;
	name?: string | null;
};

export const createFavoriteOutfit = async (payload: CreateFavoritePayload) => {
	const res = await authFetch(`${FASTAPI_URL}/favorites/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: null,
			...payload,
		}),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data?.detail || "Failed to save favorite outfit");
	}

	return data;
};

export const getFavoriteOutfits = async (userId: string) => {
	const res = await authFetch(`${FASTAPI_URL}/favorites/user/${userId}`);
	const data = await res.json().catch(() => null);

	if (!res.ok) {
		throw new Error(data?.detail || "Failed to load favorite outfits");
	}

	return data?.outfits ?? [];
};

export const deleteFavoriteOutfit = async (userId: string, outfitId: string) => {
	const res = await authFetch(`${FASTAPI_URL}/favorites/${outfitId}/favorite?user_id=${userId}`, {
		method: "DELETE",
	});

	const data = await res.json().catch(() => null);

	if (!res.ok) {
		throw new Error(data?.detail || "Failed to delete favorite outfit");
	}

	return data;
};
