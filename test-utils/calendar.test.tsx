import { authFetch } from "@/supabase/tokenBasedAuth";
import "@testing-library/react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import CalendarScreen from "../app/(tabs)/calendar";

jest.mock("react-native-calendars", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Calendar: ({ dayComponent }: { dayComponent: (args: { date: { dateString: string; day: number }; state: string }) => React.ReactNode }) => (
      <View>
        {dayComponent({
          date: { dateString: "2026-03-30", day: 30 },
          state: "",
        })}
      </View>
    ),
  };
});

jest.mock("@/components/deleteButton", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");

  return function MockDeleteButton({ onPress, label = "Delete" }: { onPress: () => void; label?: string }) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock("@/supabase/tokenBasedAuth", () => ({
  authFetch: jest.fn(),
}));

const mockedAuthFetch = authFetch as jest.MockedFunction<typeof authFetch>;

function createResponse(ok: boolean, body: unknown) {
  return {
    ok,
    json: jest.fn().mockResolvedValue(body),
  } as never;
}

describe("Calendar screen", () => {
  let monthMarks: Array<{ date: string; count: number }>;
  let dayLogs: Array<{
    wear_log_id: string;
    worn_at: string;
    outfit_id: string;
    outfit_name: string;
    items: [];
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-30T10:00:00.000Z"));

    monthMarks = [{ date: "2026-03-30", count: 1 }];
    dayLogs = [
      {
        wear_log_id: "log-1",
        worn_at: "2026-03-30T09:00:00.000Z",
        outfit_id: "outfit-1",
        outfit_name: "Outfit",
        items: [],
      },
    ];

    mockedAuthFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes("/logged_outfits/month?")) {
        return Promise.resolve(createResponse(true, monthMarks));
      }

      if (url.includes("/logged_outfits/day?")) {
        return Promise.resolve(createResponse(true, dayLogs));
      }

      if (url.includes("/logged_outfits/log-1") && options?.method === "DELETE") {
        monthMarks = [];
        dayLogs = [];
        return Promise.resolve(createResponse(true, { success: true }));
      }

      throw new Error(`Unhandled authFetch URL: ${url}`);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("shows the icon when the selected day has a logged outfit", async () => {
    render(<CalendarScreen />);

    await waitFor(() => {
      expect(mockedAuthFetch).toHaveBeenCalledWith(
        expect.stringContaining("/logged_outfits/month?user_id=user-123&month=2026-03")
      );
    });

    expect(await screen.findByText("🧥")).toBeTruthy();
  });

  test("does show the outfits for the selected day", async () => {
    render(<CalendarScreen />);
    
    await waitFor(() => {
      expect(mockedAuthFetch).toHaveBeenCalledWith(
        expect.stringContaining("/logged_outfits/month?user_id=user-123&month=2026-03")
      );
    });

    expect(await screen.findByText("🧥")).toBeTruthy();
    fireEvent.press(await screen.findByText("30"));

    await waitFor(() => {
      expect(mockedAuthFetch).toHaveBeenCalledWith(
        expect.stringContaining("/logged_outfits/day?user_id=user-123&date_str=2026-03-30")
      );
    });

    expect(await screen.findByText("OOTD — 2026-03-30")).toBeTruthy();
    expect(await screen.findByText("Outfit")).toBeTruthy();
  });

  test("delete button is shown for the outfit logged today", async () => {
    render(<CalendarScreen />);
    await waitFor(() => {
      expect(mockedAuthFetch).toHaveBeenCalledWith(
        expect.stringContaining("/logged_outfits/month?user_id=user-123&month=2026-03")
      );
    });
    expect(await screen.findByText("🧥")).toBeTruthy()
    fireEvent.press(await screen.findByText("30"))
    await waitFor(() => {
      expect(screen.queryByText("Delete")).toBeTruthy()
    });
  });
});
