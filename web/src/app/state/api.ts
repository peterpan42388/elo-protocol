import { useMemo } from "react";
import { EloApiClient } from "../lib/apiClient";
import { useApiClientSettings } from "./auth";

export function useApiClient(): EloApiClient {
  const settings = useApiClientSettings();
  return useMemo(() => new EloApiClient(settings), [settings]);
}
