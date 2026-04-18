import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  getInsightSummary,
  type InsightPeriod,
  type InsightSummary,
} from '@/services/insight-service';

export function useInsights(userId: number, period: InsightPeriod) {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadInsights = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      setSummary(getInsightSummary(userId, period));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load insights.');
    } finally {
      setIsLoading(false);
    }
  }, [period, userId]);

  useEffect(() => {
    reloadInsights();
  }, [reloadInsights]);

  useFocusEffect(
    useCallback(() => {
      reloadInsights();
    }, [reloadInsights])
  );

  return {
    error,
    isLoading,
    reloadInsights,
    summary,
  };
}
