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
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  const publicRoutes = [
    "/login-modal-view",
    "/register-modal-view",
    "/forgot-password-view",
    "/reset-password-view",
  ];

  
  // If user not logged in → force to show login/register
  if (!user) {
    if (!publicRoutes.includes(pathname)) {
      return <Redirect href="/login-modal-view" />;
    }
  }



  // If logged in → block login/register pages
  if (user) {
    if (
      pathname === "/login-modal-view" ||
      pathname === "/register-modal-view"
    ) {
      return <Redirect href="/(tabs)" />;
    }
  }

  return <Slot />;
}
