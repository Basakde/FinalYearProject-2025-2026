/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    background: "#FFFFFF",
    surface: "#F7F7F7",
    text: "#111111",
    muted: "#6E6E6E",
    border: "#E6E6E6",

    // keep tint but make it neutral
    tint: "#111111",
    icon: "#111111",
    tabIconDefault: "#999999",
    tabIconSelected: "#111111",
  },

  dark: {
    background: "#0E0E0E",
    surface: "#1A1A1A",
    text: "#F2F2F2",
    muted: "#9A9A9A",
    border: "#2A2A2A",

    tint: "#FFFFFF",
    icon: "#FFFFFF",
    tabIconDefault: "#7A7A7A",
    tabIconSelected: "#FFFFFF",
  },
};

export const createTypography = (scale: number) => ({
  header: {
    fontSize: 5 * scale,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  section: {
    fontSize: 5 * scale,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  body: {
    fontSize: 4 * scale,
    letterSpacing: 0.2,
  },
});

export const Layout = {
  radius: 4,    
  gap: 6,         // tight grids
  screenPadding: 16,
};

export const FontScale = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
