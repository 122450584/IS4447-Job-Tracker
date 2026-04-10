import { useCallback, useEffect, useState } from 'react';

import { type Application } from '@/db/schema';
import {
  type ApplicationInput,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
  type UpdateApplicationInput,
} from '@/services/application-service';

export function useApplications(userId: number | null | undefined) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reloadApplications = useCallback(() => {
    if (!userId) {
      setApplications([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setApplications(listApplications(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Applications could not be loaded.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reloadApplications();
  }, [reloadApplications]);

  const addApplication = useCallback(
    async (input: Omit<ApplicationInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Log in before adding applications.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const application = createApplication({ ...input, userId });
        setApplications(listApplications(userId));
        return application;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Application could not be created.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const editApplication = useCallback(
    async (input: Omit<UpdateApplicationInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Log in before editing applications.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const application = updateApplication({ ...input, userId });
        setApplications(listApplications(userId));
        return application;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Application could not be updated.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const removeApplication = useCallback(
    (id: number) => {
      if (!userId) {
        return;
      }

      setError(null);

      try {
        deleteApplication(id, userId);
        setApplications(listApplications(userId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Application could not be deleted.';
        setError(message);
      }
    },
    [userId]
  );

  return {
    addApplication,
    applications,
    editApplication,
    error,
    isLoading,
    reloadApplications,
    removeApplication,
  };
}
