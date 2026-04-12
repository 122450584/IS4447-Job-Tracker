import { useCallback, useEffect, useState } from 'react';

import {
  createTarget,
  deleteTarget,
  listTargetProgress,
  type TargetInput,
  type TargetProgress,
  updateTarget,
  type UpdateTargetInput,
} from '@/services/target-service';

export function useTargets(userId: number | null | undefined) {
  const [targets, setTargets] = useState<TargetProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reloadTargets = useCallback(() => {
    if (!userId) {
      setTargets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setTargets(listTargetProgress(userId));
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
    targets,
  };
}
