import { type Application, type Category } from '@/db/schema';

const csvHeaders = [
  'Company',
  'Job title',
  'Category',
  'Applied date',
  'Status',
  'Metric value',
  'Location',
  'Job URL',
  'Notes',
];

function escapeCsvValue(value: string | number | null | undefined) {
  const text = String(value ?? '');

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildApplicationsCsv(applications: Application[], categories: Category[]) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const rows = applications.map((application) => [
    application.company_name,
    application.job_title,
    categoryNames.get(application.category_id) ?? 'Unknown',
    application.applied_date,
    formatStatus(application.current_status),
    application.metric_value,
    application.location,
    application.job_url,
    application.notes,
  ]);

  return [csvHeaders, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
}

export function createCsvFileName() {
  const datePart = new Date().toISOString().slice(0, 10);

  return `job-applications-${datePart}.csv`;
}
