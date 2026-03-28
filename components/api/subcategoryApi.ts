import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/supabaseConfig";
import { Subcategory } from "@/types/items";

export const getSubcategories = async (
  userId: string,
  categoryId: number
): Promise<Subcategory[]> => {
  const res = await authFetch(
    `${FASTAPI_URL}/subcategories/?user_id=${userId}&category_id=${categoryId}`
  );
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to load subcategories");
  }

  return (data?.subcategories ?? []).map((subcategory: any) => ({
    id: Number(subcategory.id),
    name: String(subcategory.name),
    category_id: subcategory.category_id == null ? null : Number(subcategory.category_id),
  }));
};

export const createSubcategory = async (
  userId: string,
  categoryId: number,
  name: string
) => {
  const res = await authFetch(`${FASTAPI_URL}/subcategories/create_subcategory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      category_id: categoryId,
      name,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to create subcategory");
  }

  return data;
};