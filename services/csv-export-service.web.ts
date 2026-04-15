import { listApplications } from '@/services/application-service';
import { listCategories } from '@/services/category-service';
import { buildApplicationsCsv, createCsvFileName } from '@/services/csv-export-utils';

export type CsvExportResult = {
  fileName: string;
  recordCount: number;
  uri: string;
};

export async function exportApplicationsToCsv(userId: number): Promise<CsvExportResult> {
  const applications = listApplications(userId);

  if (applications.length === 0) {
    throw new Error('Add at least one application before exporting.');
  }

  const categories = listCategories(userId);
  const csv = buildApplicationsCsv(applications, categories);
  const fileName = createCsvFileName();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    fileName,
    recordCount: applications.length,
    uri: fileName,
  };
}
