import { getCategories } from "@/components/api/categoryApi";
import { getFavoriteOutfits } from "@/components/api/favoriteApi";
import { getUserItems } from "@/components/api/itemApi";
import { createSubcategory, getSubcategories } from "@/components/api/subcategoryApi";
import "@testing-library/react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import WardrobeScreen from "../app/(tabs)/wardrobe";

jest.mock("@/components/api/categoryApi", () => ({
  getCategories: jest.fn(),
}));

jest.mock("@/components/api/itemApi", () => ({
  getUserItems: jest.fn(),
}));

jest.mock("@/components/api/favoriteApi", () => ({
  getFavoriteOutfits: jest.fn(),
  deleteFavoriteOutfit: jest.fn(),
}));

jest.mock("@/components/api/subcategoryApi", () => ({
  getSubcategories: jest.fn(),
  createSubcategory: jest.fn(),
}));

const mockedGetCategories = getCategories as jest.MockedFunction<typeof getCategories>;
const mockedGetUserItems = getUserItems as jest.MockedFunction<typeof getUserItems>;
const mockedGetFavoriteOutfits = getFavoriteOutfits as jest.MockedFunction<typeof getFavoriteOutfits>;
const mockedGetSubcategories = getSubcategories as jest.MockedFunction<typeof getSubcategories>;
const mockedCreateSubcategory = createSubcategory as jest.MockedFunction<typeof createSubcategory>;

describe("Wardrobe screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetCategories.mockResolvedValue([{ id: 1, name: "Top" }] as never);
    mockedGetUserItems.mockResolvedValue([] as never);
    mockedGetFavoriteOutfits.mockResolvedValue([] as never);
    mockedGetSubcategories
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([{ id: 7, name: "Boots", category_id: 1 }] as never);
    mockedCreateSubcategory.mockResolvedValue({
      subcategory: { id: 7, name: "Boots", category_id: 1 },
    } as never);
  });

  test("allows the user to add a subcategory", async () => {
    render(<WardrobeScreen />);

    await screen.findByText("WARDROBE");
    fireEvent.press(screen.getByText("TOP"));

    await waitFor(() => {
      expect(mockedGetSubcategories).toHaveBeenCalledWith("user-123", 1);
    });

    fireEvent.press(await screen.findByText("＋"));

    expect(await screen.findByText("Add Subcategory")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("e.g. Boots"), "Boots");
    fireEvent.press(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockedCreateSubcategory).toHaveBeenCalledWith("user-123", 1, "Boots");
    });

    await waitFor(() => {
      expect(screen.getByText("Boots")).toBeTruthy();
    });
  });

  test("newly added item appears in the wardrobe", async () => {
    mockedGetUserItems.mockResolvedValue([
      {
        id: "item-1",
        category_id: 1,
        image_url: "https://example.com/blue-tshirt.jpg",
        img_description: "Blue T-Shirt",
      },
    ] as never);

    render(<WardrobeScreen />);

    expect(await screen.findByText("Blue T-Shirt")).toBeTruthy();
    expect(screen.queryByText("NO ITEMS YET")).toBeNull();
  });
});