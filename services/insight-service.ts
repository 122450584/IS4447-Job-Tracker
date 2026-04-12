import { initializeDatabase } from '@/db/init';
import { type Application, type ApplicationStatus, type Category } from '@/db/schema';
import { listApplications } from '@/services/application-service';
import { listCategories } from '@/services/category-service';

export type InsightPeriod = 'daily' | 'weekly' | 'monthly';

export type ChartPoint = {
  label: string;
  value: number;
};

export type CategoryInsight = {
  categoryId: number;
  name: string;
  color: string;
  icon: string;
  total: number;
};

export type StatusInsight = {
  status: ApplicationStatus;
  total: number;
};

export type InsightSummary = {
  period: InsightPeriod;
  totalApplications: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  busiestLabel: string | null;
  chart: ChartPoint[];
  categoryBreakdown: CategoryInsight[];
  statusBreakdown: StatusInsight[];
};

const statusOrder: ApplicationStatus[] = [
  'not_applied',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
];

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
  return nextDate;
}

function startOfWeek(date: Date) {
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getPeriodBuckets(period: InsightPeriod, today = new Date()): ChartPoint[] {
  const currentDate = parseDate(formatDate(today));

  if (period === 'daily') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(currentDate, index - 6);

      return {
        label: date.toLocaleDateString('en-IE', { weekday: 'short', timeZone: 'UTC' }),
        value: 0,
      };
    });
  }

  if (period === 'weekly') {
    const currentWeek = startOfWeek(currentDate);

    return Array.from({ length: 6 }, (_, index) => {
      const weekStart = addDays(currentWeek, (index - 5) * 7);

      return {
        label: `W${getWeekNumber(weekStart)}`,
        value: 0,
      };
    });
  }

  const currentMonth = startOfMonth(currentDate);

  return Array.from({ length: 6 }, (_, index) => {
    const monthStart = addMonths(currentMonth, index - 5);

    return {
      label: monthStart.toLocaleDateString('en-IE', { month: 'short', timeZone: 'UTC' }),
      value: 0,
    };
  });
}

function getWeekNumber(date: Date) {
  const target = new Date(date);
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const dayNumber = Math.floor((target.getTime() - yearStart.getTime()) / 86400000) + 1;

  return Math.ceil(dayNumber / 7);
}

function getBucketLabel(period: InsightPeriod, appliedDate: string) {
  const date = parseDate(appliedDate);

  if (period === 'daily') {
    return date.toLocaleDateString('en-IE', { weekday: 'short', timeZone: 'UTC' });
  }

  if (period === 'weekly') {
    return `W${getWeekNumber(startOfWeek(date))}`;
  }

  return startOfMonth(date).toLocaleDateString('en-IE', { month: 'short', timeZone: 'UTC' });
}

function getPeriodStart(period: InsightPeriod, today = new Date()) {
  const currentDate = parseDate(formatDate(today));

  if (period === 'daily') {
    return addDays(currentDate, -6);
  }

  if (period === 'weekly') {
    return addDays(startOfWeek(currentDate), -35);
  }

  return addMonths(startOfMonth(currentDate), -5);
}

function isInsidePeriod(application: Application, period: InsightPeriod, today = new Date()) {
  const appliedDate = parseDate(application.applied_date);
  const startDate = getPeriodStart(period, today);
  const endDate = parseDate(formatDate(today));

  return appliedDate >= startDate && appliedDate <= endDate;
}

function buildChart(applications: Application[], period: InsightPeriod) {
  const buckets = getPeriodBuckets(period);
  const counts = new Map(buckets.map((bucket) => [bucket.label, bucket.value]));

  applications.forEach((application) => {
    const label = getBucketLabel(period, application.applied_date);

    if (counts.has(label)) {
      counts.set(label, (counts.get(label) ?? 0) + application.metric_value);
    }
  });

  return buckets.map((bucket) => ({
    ...bucket,
    value: counts.get(bucket.label) ?? 0,
  }));
}

function buildCategoryBreakdown(applications: Application[], categories: Category[]) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const counts = new Map<number, number>();

  applications.forEach((application) => {
    counts.set(
      application.category_id,
      (counts.get(application.category_id) ?? 0) + application.metric_value
    );
  });

  return Array.from(counts.entries())
    .map(([categoryId, total]) => {
      const category = categoryMap.get(categoryId);

      return {
        categoryId,
        name: category?.name ?? 'Unknown',
        color: category?.color ?? '#687076',
        icon: category?.icon ?? 'work',
        total,
      };
    })
    .sort((first, second) => second.total - first.total);
}

function buildStatusBreakdown(applications: Application[]) {
  const counts = new Map<ApplicationStatus, number>();

  applications.forEach((application) => {
    counts.set(
      application.current_status,
      (counts.get(application.current_status) ?? 0) + application.metric_value
    );
  });

  return statusOrder
    .map((status) => ({
      status,
      total: counts.get(status) ?? 0,
    }))
    .filter((status) => status.total > 0);
}

function getBusiestLabel(chart: ChartPoint[]) {
  const busiest = chart.reduce<ChartPoint | null>((current, point) => {
    if (!current || point.value > current.value) {
      return point;
    }

    return current;
  }, null);

  if (!busiest || busiest.value === 0) {
    return null;
  }

  return busiest.label;
}

export function getInsightSummary(userId: number, period: InsightPeriod): InsightSummary {
  initializeDatabase();

  const periodApplications = listApplications(userId).filter((application) =>
    isInsidePeriod(application, period)
  );
  const categories = listCategories(userId);
  const chart = buildChart(periodApplications, period);

  return {
    period,
    totalApplications: periodApplications.reduce(
      (total, application) => total + application.metric_value,
      0
    ),
    interviewCount: periodApplications.filter(
      (application) => application.current_status === 'interviewing'
    ).length,
    offerCount: periodApplications.filter((application) => application.current_status === 'offer')
      .length,
    rejectedCount: periodApplications.filter(
      (application) => application.current_status === 'rejected'
    ).length,
    busiestLabel: getBusiestLabel(chart),
    chart,
    categoryBreakdown: buildCategoryBreakdown(periodApplications, categories),
    statusBreakdown: buildStatusBreakdown(periodApplications),
  };
}
