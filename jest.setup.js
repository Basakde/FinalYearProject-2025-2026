import '@testing-library/react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

/* ───── Shared screen-test mocks ───── */

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "user@example.com" },
    logout: jest.fn(),
  }),
}));

jest.mock("@/context/FontScaleContext", () => ({
  useFontScale: () => ({ scale: 1, updateScale: jest.fn() }),
}));

jest.mock("@/constants/theme", () => ({
  createTypography: () => ({
    body: { fontSize: 16 },
    header: { fontSize: 20 },
    section: { fontSize: 18 },
  }),
}));

jest.mock("@/context/ImageContext", () => ({
  useImages: () => ({
    addImages: jest.fn(),
  }),
}));

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    router: {
      push: jest.fn(),
      back: jest.fn(),
    },
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: (callback) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  Feather: () => null,
}));

jest.mock("@/components/screenHelpButton", () => () => null);