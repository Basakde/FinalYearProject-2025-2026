import { getTryonImage } from "@/components/api/userApi";
import "@testing-library/react-native";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import SettingsScreen from "../app/(tabs)/settingScreen";

jest.mock("@/components/api/userApi", () => ({
  getTryonImage: jest.fn(),
  uploadTryonImage: jest.fn(),
  deleteTryonImage: jest.fn(),
  deleteMyAccount: jest.fn(),
}));

jest.mock("@/components/deleteAccountButton", () => () => null);

jest.mock("@/supabase/tokenBasedAuth", () => ({
  authFetch: jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue([]),
  }),
}));

const mockedGetTryonImage = getTryonImage as jest.MockedFunction<typeof getTryonImage>;

describe("Settings screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays the user try-on photo when one exists", async () => {
    mockedGetTryonImage.mockResolvedValue({
      tryon_image_url: "https://example.com/my-photo.jpg",
    } as never);

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(mockedGetTryonImage).toHaveBeenCalledWith("user-123");
    });

    expect(await screen.findByText("Try-On Photo")).toBeTruthy();
    expect(await screen.findByText("Remove Photo")).toBeTruthy();

  });

  test("shows placeholder when no try-on photo exists", async () => {
    mockedGetTryonImage.mockResolvedValue({
      tryon_image_url: undefined,
    } as never);

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(mockedGetTryonImage).toHaveBeenCalledWith("user-123");
    });

    expect(await screen.findByText("Try-On Photo")).toBeTruthy();
    expect(await screen.findByText("Upload Photo")).toBeTruthy();
  });
});
