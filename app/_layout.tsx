import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FontScaleProvider } from "@/context/FontScaleContext";
import { ImageProvider } from "@/context/ImageContext";
import { Redirect, Slot, usePathname } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ImageProvider>
        <FontScaleProvider>
          <AuthGate />
        </FontScaleProvider>
      </ImageProvider>
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading, hasConsent } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  const publicRoutes = [
    "/login-modal-view",
    "/register-modal-view",
    "/forgot-password-view",
    "/reset-password-view",
  ];

  const consentRoute = "/consent-view";

  if (!user) {
    if (!publicRoutes.includes(pathname)) {
      return <Redirect href="/login-modal-view" />;
    }
    return <Slot />;
  }

  if (hasConsent === null) return null;

  if (!hasConsent) {
    if (pathname !== consentRoute) {
      return <Redirect href="/consent-view" />;
    }
    return <Slot />;
  }

  if (
    pathname === "/login-modal-view" ||
    pathname === "/register-modal-view" ||
    pathname === consentRoute
  ) {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
}