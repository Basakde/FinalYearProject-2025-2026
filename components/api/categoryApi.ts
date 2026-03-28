import { FASTAPI_URL } from "@/IP_Config";
import { Category } from "@/types/items";

export type WardrobeCategory = Omit<Category, "id"> & {
  id: number;
};

export const getCategories = async (): Promise<WardrobeCategory[]> => {
  const res = await fetch(`${FASTAPI_URL}/categories/`);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to load categories");
  }

  return (data?.categories ?? [])
    .filter((category: any) => category?.id != null)
    .map((category: any) => ({
      id: Number(category.id),
      name: String(category.name),
    }));
};