import { getUserItems } from "@/components/api/itemApi";
import { createLoggedOutfit } from "@/components/api/loggedOutfitApi";
import "@testing-library/react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import PickOutfit from "../app/(tabs)/pickOutfit";

jest.mock("@/components/outfitSlider", () => () => null);

jest.mock("@/components/api/itemApi", () => ({
  getUserItems: jest.fn(),
  getUnwornItems: jest.fn(),
}));

jest.mock("@/components/api/loggedOutfitApi", () => ({
  createLoggedOutfit: jest.fn(),
}));

const mockedGetUserItems = getUserItems as jest.MockedFunction<typeof getUserItems>;
const mockedCreateLoggedOutfit = createLoggedOutfit as jest.MockedFunction<typeof createLoggedOutfit>;

describe("Pick Outfit screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetUserItems.mockResolvedValue([
      { id: "top-1", category_id: 1, image_url: "top.png" },
      { id: "bottom-1", category_id: 2, image_url: "bottom.png" },
      { id: "shoes-1", category_id: 4, image_url: "shoes.png" },
    ] as never);

    mockedCreateLoggedOutfit.mockResolvedValue({ wear_log_id: "log-1" } as never);
  });

  test("logs an outfit when WEAR TODAY is pressed", async () => {
    render(<PickOutfit />);

    fireEvent.press(await screen.findByText("GENERAL VIEW"));
    fireEvent.press(await screen.findByText("WEAR TODAY"));

    await waitFor(() => {
      expect(mockedCreateLoggedOutfit).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          top_id: "top-1",
          bottom_id: "bottom-1",
          shoes_id: "shoes-1",
          worn_at: null,
        })
      );
    });

    await waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith("/(tabs)/calendar");
    });

    expect(router.back).not.toHaveBeenCalled();
  });
});