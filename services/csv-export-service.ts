import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { initializeDatabase } from '@/db/init';
import { listApplications } from '@/services/application-service';
import { listCategories } from '@/services/category-service';
import { buildApplicationsCsv, createCsvFileName } from '@/services/csv-export-utils';

export type CsvExportResult = {
  fileName: string;
  recordCount: number;
  uri: string;
};

export async function exportApplicationsToCsv(userId: number): Promise<CsvExportResult> {
  initializeDatabase();

  const applications = listApplications(userId);

  if (applications.length === 0) {
    throw new Error('Add at least one application before exporting.');
  }

  const categories = listCategories(userId);
  const fileName = createCsvFileName();
  const exportDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!exportDirectory) {
    throw new Error('A local export folder is not available on this device.');
  }

  const fileUri = `${exportDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, buildApplicationsCsv(applications, categories), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
      dialogTitle: 'Export job applications',
    });
  }

  return {
    fileName,
    recordCount: applications.length,
    uri: fileUri,
  };
}
