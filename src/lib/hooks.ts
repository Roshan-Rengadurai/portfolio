"use client";

import { useEffect, useState } from "react";

/** True only after mount — guards against hydration mismatches for live data. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

