import { useCallback, useState } from 'react';

import {
  type CsvExportResult,
  exportApplicationsToCsv,
} from '@/services/csv-export-service';

export function useCsvExport(userId: number | null | undefined) {
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<CsvExportResult | null>(null);

  const exportCsv = useCallback(async () => {
    if (!userId) {
      setError('Log in before exporting applications.');
      return null;
    }

    setError(null);
    setIsExporting(true);

    try {
      const result = await exportApplicationsToCsv(userId);
      setLastExport(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Applications could not be exported.';
      setError(message);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [userId]);

  return {
    error,
    exportCsv,
    isExporting,
    lastExport,
  };
}
