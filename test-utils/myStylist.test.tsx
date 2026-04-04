import { getOutfitSuggestions } from "@/components/api/outfitSuggestionsApi";
import { generateQuickTryOn } from "@/components/api/userApi";
import { getWeather } from "@/components/api/weatherApi";
import '@testing-library/react-native';
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import SuggestionsScreen from "../app/(tabs)/myStylist";

jest.mock("@/components/occasionSelector", () => () => null);
jest.mock("@/components/outfitRow", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  return function MockOutfitRow({ label, uri }: { label: string; uri?: string }) {
    return (
      <View>
        <Text>{label}</Text>
        {uri ? <Text>{uri}</Text> : null}
      </View>
    );
  };
});

jest.mock("@/components/api/weatherApi", () => ({
  getWeather: jest.fn(),
}));

jest.mock("@/components/api/outfitSuggestionsApi", () => ({
  getOutfitSuggestions: jest.fn(),
}));

jest.mock("@/components/api/userApi", () => ({
  generateQuickTryOn: jest.fn(),
}));

jest.mock("@/components/api/favoriteApi", () => ({
  createFavoriteOutfit: jest.fn(),
}));

jest.mock("@/components/api/loggedOutfitApi", () => ({
  createLoggedOutfit: jest.fn(),
}));

jest.mock("@/components/api/preferenceApi", () => ({
  setOutfitPreference: jest.fn(),
}));

const mockedGetWeather = getWeather as jest.MockedFunction<typeof getWeather>;
const mockedGetOutfitSuggestions = getOutfitSuggestions as jest.MockedFunction<typeof getOutfitSuggestions>;
const mockedGenerateQuickTryOn = generateQuickTryOn as jest.MockedFunction<typeof generateQuickTryOn>;

const suggestionPayload = {
  weather: { temp: 18, icon: "01d", wind: 5 },
  rules: { allowed_seasons: ["spring"], include_jacket: false },
  suggestions: [
    {
      type: "twopiece" as const,
      top: { id: "top-1", processed_img_url: "https://example.com/top.png" },
      bottom: { id: "bottom-1", processed_img_url: "https://example.com/bottom.png" },
      shoes: { id: "shoes-1", processed_img_url: "https://example.com/shoes.png" },
      outerwear: null,
      jumpsuit: null,
    },
  ],
  message:null,
};

describe("My Stylist screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetWeather.mockResolvedValue({
      coord: { lat: 51.5, lon: -0.1 },
      main: { temp: 18, feels_like: 16 },
    } as never);

    mockedGetOutfitSuggestions.mockResolvedValue(suggestionPayload as never);
    mockedGenerateQuickTryOn.mockResolvedValue({ result_url: "https://example.com/try-on.png" } as never);
  });

  test("requests suggestions and renders the suggested outfit", async () => {
    render(<SuggestionsScreen />);

    await screen.findByText("18°");

    fireEvent.press(screen.getByText("GET OUTFIT"));

    await waitFor(() => {
      expect(mockedGetOutfitSuggestions).toHaveBeenCalledWith({
        user_id: "user-123",
        lat: 51.5,
        lon: -0.1,
        master_occasion_id: null,
      });
    });

    expect(await screen.findByText("TOP")).toBeTruthy();
    expect(screen.getByText("BOTTOM")).toBeTruthy();
    expect(screen.getByText("SHOES")).toBeTruthy();
    expect(screen.getByText("NEXT")).toBeTruthy();
    expect(screen.queryByText("OOTD")).toBeTruthy();
  });

  test("shows backend message when no outfit suggestions are returned", async () => {
    mockedGetOutfitSuggestions.mockResolvedValue({
      weather: { temp: 18, icon: "01d", wind: 5 },
      rules: { allowed_seasons: ["spring"], include_jacket: false },
      suggestions: [],
      message: "No outfit could be generated with the available wardrobe items.",
    } as never);

    render(<SuggestionsScreen />);

    await screen.findByText("18°");

    fireEvent.press(screen.getByText("GET OUTFIT"));

    expect(await screen.findByText("NO OUTFIT FOUND")).toBeTruthy();
    expect(
      await screen.findByText("No outfit could be generated with the available wardrobe items.")
    ).toBeTruthy();

    expect(screen.queryByText("TOP")).toBeNull();
    expect(screen.queryByText("BOTTOM")).toBeNull();
    expect(screen.queryByText("SHOES")).toBeNull();
    expect(screen.queryByText("TRY ON")).toBeNull();
    expect(screen.queryByText("OOTD")).toBeNull();
    });


  test("opens the try-on modal for the suggested outfit", async () => {
    render(<SuggestionsScreen />);

    await screen.findByText("18°");
    fireEvent.press(screen.getByText("GET OUTFIT"));

    await screen.findByText("TRY ON");
    fireEvent.press(screen.getByText("TRY ON"));

    await waitFor(() => {
      expect(mockedGenerateQuickTryOn).toHaveBeenCalledWith({
        user_id: "user-123",
        top_url: "https://example.com/top.png",
        bottom_url: "https://example.com/bottom.png",
        shoes_url: "https://example.com/shoes.png",
        outerwear_url: null,
        jumpsuit_url: null,
        outfit_type: "twopiece",
      });
    });

    expect(await screen.findByText("Try On View")).toBeTruthy();
    expect(screen.getByText("Close")).toBeTruthy();
  });

  test("handles quick try-on errors gracefully", async () => {
    mockedGenerateQuickTryOn.mockRejectedValueOnce(new Error("Try-on failed"));

    render(<SuggestionsScreen />);

    await screen.findByText("18°");
    fireEvent.press(screen.getByText("GET OUTFIT"));

    await screen.findByText("TRY ON");
    fireEvent.press(screen.getByText("TRY ON"));

    expect(
    await screen.findByText("There was an issue generating your try-on. Please try again later.")
  ).toBeTruthy();

    expect(await screen.findByText("Try On View")).toBeTruthy();
    expect(screen.getByText("Close")).toBeTruthy();
  });
});