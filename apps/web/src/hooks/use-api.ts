"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions {
  /** Skip auto-fetch on mount */
  manual?: boolean;
  /** Polling interval in ms (0 = no polling) */
  pollInterval?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching data from the API with loading/error states and optional polling.
 */
export function useApi<T>(
  fetcher: () => Promise<{ success: boolean; data: T }>,
  options?: UseApiOptions
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.manual);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!options?.manual) {
      refetch();
    }
  }, [options?.manual, refetch]);

  // Polling
  useEffect(() => {
    if (options?.pollInterval && options.pollInterval > 0) {
      intervalRef.current = setInterval(async () => {
        try {
          const res = await fetcher();
          setData(res.data);
        } catch {
          // Silent fail on poll — don't disrupt UI
        }
      }, options.pollInterval);

      return () => clearInterval(intervalRef.current);
    }
  }, [options?.pollInterval, fetcher]);

  return { data, loading, error, refetch };
}

/**
 * Hook for mutations (POST/PATCH/DELETE) with loading and error states.
 */
export function useMutation<TInput, TOutput = unknown>(
  mutator: (input: TInput) => Promise<{ success: boolean; data: TOutput }>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (input: TInput): Promise<TOutput | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await mutator(input);
        return res.data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An error occurred";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  return { execute, loading, error };
}
