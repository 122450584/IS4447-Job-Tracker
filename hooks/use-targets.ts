import { useCallback, useEffect, useState } from 'react';

import {
  createTarget,
  deleteTarget,
  getTargetStreakSummary,
  listTargetProgress,
  type TargetInput,
  type TargetProgress,
  updateTarget,
  type UpdateTargetInput,
} from '@/services/target-service';
import { type TargetStreakSummary } from '@/services/target-streak-utils';

const emptyStreakSummary: TargetStreakSummary = {
  weekly: {
    currentStreak: 0,
    lastCompletedPeriod: null,
    metPeriods: 0,
    trackedPeriods: 0,
  },
  monthly: {
    currentStreak: 0,
    lastCompletedPeriod: null,
    metPeriods: 0,
    trackedPeriods: 0,
  },
};

export function useTargets(userId: number | null | undefined) {
  const [targets, setTargets] = useState<TargetProgress[]>([]);
  const [streakSummary, setStreakSummary] = useState<TargetStreakSummary>(emptyStreakSummary);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reloadTargets = useCallback(() => {
    if (!userId) {
      setTargets([]);
      setStreakSummary(emptyStreakSummary);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setTargets(listTargetProgress(userId));
      setStreakSummary(getTargetStreakSummary(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Targets could not be loaded.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reloadTargets();
  }, [reloadTargets]);

  const addTarget = useCallback(
    async (input: Omit<TargetInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Log in before adding targets.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const target = createTarget({ ...input, userId });
        setTargets(listTargetProgress(userId));
        setStreakSummary(getTargetStreakSummary(userId));
        return target;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Target could not be created.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const editTarget = useCallback(
    async (input: Omit<UpdateTargetInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Log in before editing targets.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const target = updateTarget({ ...input, userId });
        setTargets(listTargetProgress(userId));
        setStreakSummary(getTargetStreakSummary(userId));
        return target;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Target could not be updated.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const removeTarget = useCallback(
    (id: number) => {
      if (!userId) {
        return;
      }

      setError(null);

      try {
        deleteTarget(id, userId);
        setTargets(listTargetProgress(userId));
        setStreakSummary(getTargetStreakSummary(userId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Target could not be deleted.';
        setError(message);
      }
    },
    [userId]
  );

  return {
    addTarget,
    editTarget,
    error,
    isLoading,
    reloadTargets,
    removeTarget,
    streakSummary,
    targets,
  };
}
