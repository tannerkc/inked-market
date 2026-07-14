"use client";

import { useCallback, useState } from "react";
import { getCustomerAftercare } from "@/lib/data/customer-dashboard";
import type { AftercareTimeline } from "@/lib/types";

export function useAftercareTracker() {
  const [aftercareTimelines, setAftercareTimelines] = useState<AftercareTimeline[]>(getCustomerAftercare);

  const handleToggleAftercare = useCallback((timelineId: string, stepId: string) => {
    setAftercareTimelines((prev) =>
      prev.map((timeline) => {
        if (timeline.id !== timelineId) return timeline;
        return {
          ...timeline,
          steps: timeline.steps.map((step) => {
            if (step.id !== stepId) return step;
            const completed = !step.completed;
            return { ...step, completed, completedAt: completed ? new Date() : undefined };
          }),
        };
      })
    );
  }, []);

  return { aftercareTimelines, handleToggleAftercare };
}
