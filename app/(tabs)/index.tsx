import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "../home-view";
export default function TabIndex() {
  return(
  <SafeAreaProvider>
    <HomeScreen />;
  </SafeAreaProvider>
)}
