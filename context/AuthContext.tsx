import { supabase } from "@/supabase/supabaseConfig";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMyConsent } from "@/components/api/consentApi";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  hasConsent: boolean | null;
  logout: () => Promise<void>;
  refreshConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasConsent: null,
  logout: async () => {},
  refreshConsent: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  const loadConsent = async (currentUser: any | null) => {
    if (!currentUser) {
      setHasConsent(null);
      return;
    }

    try {
      const data = await getMyConsent();
      setHasConsent(!!data?.gdpr_consent);
    } catch (e) {
      console.log("Consent load failed");
      setHasConsent(false);
    }
  };

  const refreshConsent = async () => {
    await loadConsent(user);
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) console.log("Error loading session:", error.message);

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadConsent(currentUser);
      }

      setLoading(false);
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadConsent(currentUser);
      } else {
        setHasConsent(null);
      }

      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHasConsent(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasConsent, logout, refreshConsent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);