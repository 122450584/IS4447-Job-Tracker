import { useMemo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { FormField } from '@/components/form-field';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useJobLeads } from '@/hooks/use-job-leads';
import { type JobLead } from '@/services/job-leads-service';

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function LeadCard({ lead }: { lead: JobLead }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <AppCard>
      <View style={styles.cardHeader}>
        <ThemedText type="subtitle" style={styles.title}>
          {lead.title}
        </ThemedText>
        <View style={[styles.badge, { borderColor: colors.border }]}>
          <ThemedText style={styles.badgeText}>{lead.category}</ThemedText>
        </View>
      </View>

      <ThemedText type="defaultSemiBold">{lead.companyName}</ThemedText>

      <View style={styles.detailGrid}>
        <ThemedText style={styles.detailText}>{lead.location}</ThemedText>
        {lead.jobType ? <ThemedText style={styles.detailText}>{lead.jobType}</ThemedText> : null}
        {lead.salary ? <ThemedText style={styles.detailText}>{lead.salary}</ThemedText> : null}
        <ThemedText style={styles.detailText}>Posted {formatDate(lead.publicationDate)}</ThemedText>
      </View>

      <AppButton
        onPress={() => {
          void Linking.openURL(lead.url);
        }}
        title="Open listing"
        variant="secondary"
      />
    </AppCard>
  );
}

function matchesLeadQuery(lead: JobLead, query: string) {
  if (!query) {
    return true;
  }

  const searchable = [lead.title, lead.companyName, lead.category, lead.location, lead.jobType ?? '', lead.salary ?? '']
    .join(' ')
    .toLowerCase();

  return searchable.includes(query);
}

export function JobLeadsList() {
  const { error, hasLoaded, isLoading, leads, loadLeads, searchText, setSearchText } = useJobLeads();
  const trimmedSearch = searchText.trim();
  const query = trimmedSearch.toLowerCase();
  const visibleLeads = useMemo(() => leads.filter((lead) => matchesLeadQuery(lead, query)), [leads, query]);

  return (
    <>
      <AppCard>
        <ThemedText type="subtitle">Find remote roles</ThemedText>
        <ThemedText>
          Search public remote listings and open the original posting when a role looks relevant.
        </ThemedText>
        <FormField
          autoCapitalize="none"
          label="Search"
          onChangeText={setSearchText}
          placeholder="Enter keywords"
          returnKeyType="search"
          value={searchText}
          onSubmitEditing={() => {
            void loadLeads(trimmedSearch);
          }}
        />
        <AppButton
          loading={isLoading}
          onPress={() => {
            void loadLeads(trimmedSearch);
          }}
          title="Search leads"
        />
        <ThemedText style={styles.sourceText}>
          Job leads provided by Remotive.
        </ThemedText>
      </AppCard>

      {error ? (
        <ErrorState
          actionLabel="Try again"
          message={error}
          onActionPress={() => {
            void loadLeads(trimmedSearch);
          }}
          title="Could not load job leads"
        />
      ) : null}

      {!error && isLoading ? (
        <AppCard>
          <ThemedText type="subtitle">Loading job leads</ThemedText>
          <ThemedText>Fetching current remote listings from Remotive.</ThemedText>
        </AppCard>
      ) : null}

      {!error && hasLoaded && !isLoading && visibleLeads.length === 0 ? (
        <EmptyState
          title="No job leads found"
          message="Try a broader search such as frontend, data, mobile, or junior developer."
        />
      ) : null}

      <View style={styles.list}>
        {visibleLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardHeader: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  detailGrid: {
    gap: Spacing.xs,
  },
  detailText: {
    lineHeight: 22,
  },
  list: {
    gap: Spacing.lg,
  },
  sourceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    flexShrink: 1,
  },
});
