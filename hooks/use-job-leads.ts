import { useCallback, useEffect, useState } from 'react';

import { fetchJobLeads, type JobLead } from '@/services/job-leads-service';

const defaultSearchText = '';

export function useJobLeads() {
  const [leads, setLeads] = useState<JobLead[]>([]);
  const [searchText, setSearchText] = useState(defaultSearchText);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadLeads = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setLeads(await fetchJobLeads(query));
    } catch (err) {
      setLeads([]);
      setError(err instanceof Error ? err.message : 'Job leads could not be loaded.');
    } finally {
      setHasLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads(defaultSearchText);
  }, [loadLeads]);

  return {
    error,
    hasLoaded,
    isLoading,
    leads,
    loadLeads,
    searchText,
    setSearchText,
  };
}
