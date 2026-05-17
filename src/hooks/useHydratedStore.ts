"use client";

import { useState, useEffect } from "react";

/**
 * Zustandストアから状態を取得しつつ、SSRハイドレーションエラーを防止するフック。
 * Server-Firstの思想に基づき、クライアント状態の注入による不要な差分エラーを防ぎます。
 */
export const useHydratedStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
  fallback?: F
): F | typeof fallback => {
  const result = store(callback) as F;
  const [data, setData] = useState<F | typeof fallback>(fallback);

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
