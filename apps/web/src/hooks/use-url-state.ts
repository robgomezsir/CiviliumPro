"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState<T extends string>(
  key: string,
  defaultValue: T,
  allowedValues?: readonly T[],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    const raw = searchParams.get(key) as T | null;
    if (!raw) return defaultValue;
    if (allowedValues && !allowedValues.includes(raw)) return defaultValue;
    return raw;
  }, [searchParams, key, defaultValue, allowedValues]);

  const setValue = useCallback(
    (next: T) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, next);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, key],
  );

  return [value, setValue] as const;
}

export function useUrlListState(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const raw = searchParams.get(key);
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams, key]);

  const setValues = useCallback(
    (next: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.length === 0) params.delete(key);
      else params.set(key, next.join(","));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, key],
  );

  return [values, setValues] as const;
}

export function useUrlNumberState(key: string, defaultValue: number) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    const raw = searchParams.get(key);
    const parsed = raw ? Number(raw) : defaultValue;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, String(next));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, key],
  );

  return [value, setValue] as const;
}
