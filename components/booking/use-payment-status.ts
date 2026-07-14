"use client";

import { useCallback, useEffect, useState } from "react";

export interface ProviderStatus {
  configured: boolean;
  connected: boolean;
  accountName: string | null;
}

export interface PaymentStatus {
  stripe: ProviderStatus;
  square: ProviderStatus;
  chosen: "stripe" | "square" | null;
}

export function usePaymentStatus() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/payments/status");
    if (res.ok) setStatus((await res.json()) as PaymentStatus);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/payments/status");
      if (cancelled) return;
      if (res.ok) setStatus((await res.json()) as PaymentStatus);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, loading, refresh };
}
