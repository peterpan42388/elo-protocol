import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";
import type { ApiClientSettings } from "../lib/types";

const AUTH_STORAGE_KEY = "elo.market.web.auth.v1";

export type AuthState = {
  apiBaseUrl: string;
  bearerToken: string;
  hmacSecret: string;
  defaultConsumerAgentId: string;
};

type AuthContextValue = {
  auth: AuthState;
  updateAuth: (patch: Partial<AuthState>) => void;
};

const DEFAULT_AUTH: AuthState = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/elo-api",
  bearerToken: "",
  hmacSecret: "",
  defaultConsumerAgentId: "",
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitialAuth(): AuthState {
  const fromStorage = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY);
  if (!fromStorage) return DEFAULT_AUTH;

  try {
    const parsed = JSON.parse(fromStorage) as Partial<AuthState>;
    return {
      ...DEFAULT_AUTH,
      ...parsed,
      apiBaseUrl: parsed.apiBaseUrl || DEFAULT_AUTH.apiBaseUrl,
    };
  } catch {
    return DEFAULT_AUTH;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>(() => loadInitialAuth());

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      updateAuth: (patch) => {
        setAuth((prev) => {
          const next = { ...prev, ...patch };
          globalThis.localStorage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

export function useApiClientSettings(): ApiClientSettings {
  const { auth } = useAuth();
  return {
    apiBaseUrl: auth.apiBaseUrl,
    bearerToken: auth.bearerToken || undefined,
    hmacSecret: auth.hmacSecret || undefined,
  };
}
