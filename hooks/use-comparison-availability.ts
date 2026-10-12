"use client";

import { useEffect, useState } from "react";
import { COMPARISON_CHANGED_EVENT, loadComparison } from "@/lib/profile-storage";

export function useComparisonAvailability() {
  const [selectionCount, setSelectionCount] = useState(0);

  useEffect(() => {
    const sync = () => setSelectionCount(loadComparison().length);
    const timer = window.setTimeout(sync, 0);
    window.addEventListener(COMPARISON_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COMPARISON_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { selectionCount, canCompare: selectionCount >= 2 && selectionCount <= 3 };
}
