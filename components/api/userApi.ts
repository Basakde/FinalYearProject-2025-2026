import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/supabaseConfig";

// Get current try-on image for the user
export const getTryonImage = async (userId: string) => {
  const res = await authFetch(`${FASTAPI_URL}/users/${userId}/tryon-image`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load try-on image");
  }

  return data;
};

// Upload a new try-on image
export const uploadTryonImage = async (userId: string, imageUri: string) => {
  const formData = new FormData();

  // Send selected image as multipart form-data
  formData.append("file", {
    uri: imageUri,
    name: "tryon.jpg",
    type: "image/jpeg",
  } as any);

  const res = await authFetch(`${FASTAPI_URL}/users/${userId}/tryon-image`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to upload try-on image");
  }

  return data;
};

// Delete current try-on image
export const deleteTryonImage = async (userId: string) => {
  const res = await authFetch(`${FASTAPI_URL}/users/${userId}/tryon-image`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to delete try-on image");
  }

  return data;
};