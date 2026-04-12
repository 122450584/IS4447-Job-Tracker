import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/app-card';
import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInsights } from '@/hooks/use-insights';
import { type InsightPeriod } from '@/services/insight-service';

type InsightsDashboardProps = {
  userId: number;
  period: InsightPeriod;
  onPeriodChange: (period: InsightPeriod) => void;
};

const periodOptions: { label: string; value: InsightPeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

function formatStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function InsightsDashboard({ userId, period, onPeriodChange }: InsightsDashboardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { error, isLoading, summary } = useInsights(userId, period);
  const maxChartValue = Math.max(...(summary?.chart.map((point) => point.value) ?? [0]), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.segmentedControl, { borderColor: colors.border }]}>
        {periodOptions.map((option) => {
          const isSelected = option.value === period;

          return (
            <Pressable
              accessibilityLabel={`Show ${option.label.toLowerCase()} insights`}
              accessibilityRole="button"
              key={option.value}
              onPress={() => onPeriodChange(option.value)}
              style={[
                styles.segmentButton,
                { backgroundColor: isSelected ? colors.tint : colors.surface },
              ]}>
              <ThemedText style={[styles.segmentText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {error ? <EmptyState title="Insights unavailable" message={error} /> : null}

      {isLoading ? <EmptyState title="Loading insights" message="Reading stored applications." /> : null}

      {!isLoading && summary && summary.totalApplications === 0 ? (
        <EmptyState
          title="No insight data"
          message="Add applications in the selected date range to see charts and summaries."
        />
      ) : null}

      {!isLoading && summary && summary.totalApplications > 0 ? (
        <>
          <View style={styles.statsGrid}>
            <AppCard style={styles.statCard}>
              <ThemedText style={styles.statValue}>{summary.totalApplications}</ThemedText>
              <ThemedText style={styles.statLabel}>Applications</ThemedText>
            </AppCard>

            <AppCard style={styles.statCard}>
              <ThemedText style={styles.statValue}>{summary.interviewCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Interviews</ThemedText>
            </AppCard>

            <AppCard style={styles.statCard}>
              <ThemedText style={styles.statValue}>{summary.offerCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Offers</ThemedText>
            </AppCard>

            <AppCard style={styles.statCard}>
              <ThemedText style={styles.statValue}>{summary.rejectedCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Rejected</ThemedText>
            </AppCard>
          </View>

          <AppCard>
            <View style={styles.cardHeader}>
              <View>
                <ThemedText type="subtitle">Applications over time</ThemedText>
                <ThemedText style={styles.muted}>
                  {summary.busiestLabel
                    ? `Busiest period: ${summary.busiestLabel}`
                    : 'No busiest period yet'}
                </ThemedText>
              </View>
              <MaterialIcons color={colors.tint} name="bar-chart" size={24} />
            </View>

            <View
              accessibilityLabel="Bar chart showing stored applications by selected period"
              accessible
              style={styles.chart}>
              {summary.chart.map((point) => {
                const heightPercent = Math.max((point.value / maxChartValue) * 100, point.value > 0 ? 12 : 4);

                return (
                  <View key={point.label} style={styles.barColumn}>
                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: colors.tint,
                            height: `${heightPercent}%`,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText style={styles.barValue}>{point.value}</ThemedText>
                    <ThemedText style={styles.barLabel}>{point.label}</ThemedText>
                  </View>
                );
              })}
            </View>
          </AppCard>

          <AppCard>
            <ThemedText type="subtitle">Category breakdown</ThemedText>

            {summary.categoryBreakdown.map((category) => (
              <View key={category.categoryId} style={styles.breakdownRow}>
                <View style={styles.breakdownName}>
                  <View style={[styles.swatch, { backgroundColor: category.color }]} />
                  <MaterialIcons color={colors.muted} name={category.icon as keyof typeof MaterialIcons.glyphMap} size={18} />
                  <ThemedText style={styles.breakdownText}>{category.name}</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold">{category.total}</ThemedText>
              </View>
            ))}
          </AppCard>

          <AppCard>
            <ThemedText type="subtitle">Status breakdown</ThemedText>

            {summary.statusBreakdown.map((status) => (
              <View key={status.status} style={styles.breakdownRow}>
                <ThemedText style={styles.breakdownText}>{formatStatus(status.status)}</ThemedText>
                <ThemedText type="defaultSemiBold">{status.total}</ThemedText>
              </View>
            ))}
          </AppCard>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
    minWidth: 36,
  },
  barFill: {
    borderRadius: Radius.sm,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  barLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  barTrack: {
    borderRadius: Radius.sm,
    height: 128,
    overflow: 'hidden',
    width: '100%',
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  breakdownName: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    minWidth: 0,
  },
  breakdownRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  breakdownText: {
    flexShrink: 1,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 178,
  },
  container: {
    gap: Spacing.lg,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: Radius.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
  },
  segmentText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  segmentedControl: {
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  swatch: {
    borderRadius: Radius.sm,
    height: 16,
    width: 16,
  },
});
