import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { type Application, type ApplicationStatus, applicationStatuses } from '@/db/schema';
import { useApplications } from '@/hooks/use-applications';
import { useCategories } from '@/hooks/use-categories';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppButton } from './app-button';
import { AppCard } from './app-card';
import { EmptyState } from './empty-state';
import { ErrorMessage } from './error-message';
import { FormField } from './form-field';
import { ThemedText } from './themed-text';

type ApplicationManagerProps = {
  userId: number;
};

type CategoryIconName = keyof typeof MaterialIcons.glyphMap;

const statusLabels: Record<ApplicationStatus, string> = {
  not_applied: 'Not applied',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function ApplicationManager({ userId }: ApplicationManagerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    addApplication,
    applications,
    editApplication,
    error,
    isLoading,
    loadStatusLogs,
    removeApplication,
    statusLogsByApplicationId,
  } = useApplications(userId);
  const { categories } = useCategories(userId);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [appliedDate, setAppliedDate] = useState(todayString());
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>('not_applied');
  const [notes, setNotes] = useState('');
  const [searchText, setSearchText] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [categoryFilterId, setCategoryFilterId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const isEditing = editingId !== null;
  const hasFilters =
    searchText.trim().length > 0 ||
    startDateFilter.trim().length > 0 ||
    endDateFilter.trim().length > 0 ||
    categoryFilterId !== null;
  const activeFilterCount = [
    searchText.trim().length > 0,
    startDateFilter.trim().length > 0,
    endDateFilter.trim().length > 0,
    categoryFilterId !== null,
  ].filter(Boolean).length;
  const filteredApplications = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const startDate = startDateFilter.trim();
    const endDate = endDateFilter.trim();

    return applications.filter((application) => {
      const matchesText =
        !query ||
        application.company_name.toLowerCase().includes(query) ||
        application.job_title.toLowerCase().includes(query) ||
        application.notes?.toLowerCase().includes(query);
      const matchesCategory = !categoryFilterId || application.category_id === categoryFilterId;
      const matchesStartDate = !startDate || application.applied_date >= startDate;
      const matchesEndDate = !endDate || application.applied_date <= endDate;

      return matchesText && matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [applications, categoryFilterId, endDateFilter, searchText, startDateFilter]);

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setCompanyName('');
    setJobTitle('');
    setAppliedDate(todayString());
    setCategoryId(categories[0]?.id ?? null);
    setStatus('not_applied');
    setNotes('');
  }

  function clearFilters() {
    setSearchText('');
    setStartDateFilter('');
    setEndDateFilter('');
    setCategoryFilterId(null);
  }

  function toggleDetails(application: Application) {
    if (selectedApplicationId === application.id) {
      setSelectedApplicationId(null);
      return;
    }

    setSelectedApplicationId(application.id);
    loadStatusLogs(application.id);
  }

  function startAdding() {
    setEditingId(null);
    setCompanyName('');
    setJobTitle('');
    setAppliedDate(todayString());
    setCategoryId(categories[0]?.id ?? null);
    setStatus('not_applied');
    setNotes('');
    setShowForm(true);
  }

  function startEditing(application: Application) {
    setEditingId(application.id);
    setCompanyName(application.company_name);
    setJobTitle(application.job_title);
    setAppliedDate(application.applied_date);
    setCategoryId(application.category_id);
    setStatus(application.current_status);
    setNotes(application.notes ?? '');
    setShowForm(true);
  }

  function confirmDelete(application: Application) {
    const message = `Remove the application for ${application.job_title} at ${application.company_name}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        removeApplication(application.id);
      }
      return;
    }

    Alert.alert('Delete application', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeApplication(application.id) },
    ]);
  }

  async function handleSave() {
    if (!categoryId) {
      return;
    }

    try {
      if (isEditing) {
        await editApplication({
          id: editingId,
          categoryId,
          companyName,
          jobTitle,
          appliedDate,
          status,
          notes: notes || null,
        });

        loadStatusLogs(editingId);
      } else {
        const application = await addApplication({
          categoryId,
          companyName,
          jobTitle,
          appliedDate,
          status,
          notes: notes || null,
        });

        setSelectedApplicationId(application.id);
        loadStatusLogs(application.id);
      }

      resetForm();
    } catch {
      return;
    }
  }

  return (
    <>
      {showForm ? (
        <AppCard>
          <ThemedText type="subtitle">
            {isEditing ? 'Edit application' : 'Add application'}
          </ThemedText>

          <View style={styles.form}>
            <FormField
              label="Company name"
              onChangeText={setCompanyName}
              placeholder="Acme Corp"
              value={companyName}
            />

            <FormField
              label="Job title"
              onChangeText={setJobTitle}
              placeholder="Software Engineer"
              value={jobTitle}
            />

            <FormField
              label="Applied date (YYYY-MM-DD)"
              onChangeText={setAppliedDate}
              placeholder="2025-01-15"
              value={appliedDate}
            />

            {categories.length > 0 ? (
              <View style={styles.optionGroup}>
                <ThemedText type="defaultSemiBold">Category</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {categories.map((category) => {
                      const selected = category.id === categoryId;
                      return (
                        <Pressable
                          accessibilityLabel={`Use ${category.name} category`}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          key={category.id}
                          onPress={() => setCategoryId(category.id)}
                          style={[
                            styles.categoryChip,
                            {
                              backgroundColor: selected ? category.color : colors.surface,
                              borderColor: selected ? category.color : colors.border,
                            },
                          ]}>
                          <MaterialIcons
                            color={selected ? Colors.dark.text : colors.text}
                            name={category.icon as CategoryIconName}
                            size={16}
                          />
                          <ThemedText
                            style={[
                              styles.chipLabel,
                              { color: selected ? Colors.dark.text : colors.text },
                            ]}>
                            {category.name}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                Add a category in Settings before recording applications.
              </ThemedText>
            )}

            <View style={styles.optionGroup}>
              <ThemedText type="defaultSemiBold">Status</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {applicationStatuses.map((s) => {
                    const selected = s === status;
                    return (
                      <Pressable
                        accessibilityLabel={`Set status to ${statusLabels[s]}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        key={s}
                        onPress={() => setStatus(s)}
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: selected ? colors.tint : colors.surface,
                            borderColor: selected ? colors.tint : colors.border,
                          },
                        ]}>
                        <ThemedText
                          style={[
                            styles.chipLabel,
                            { color: selected ? Colors.dark.text : colors.text },
                          ]}>
                          {statusLabels[s]}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <FormField
              label="Notes (optional)"
              multiline
              numberOfLines={3}
              onChangeText={setNotes}
              placeholder="Any notes about this application..."
              value={notes}
            />
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.actions}>
            <AppButton
              disabled={!categoryId || isLoading}
              loading={isLoading}
              onPress={handleSave}
              title={isEditing ? 'Save changes' : 'Add application'}
            />
            <AppButton
              disabled={isLoading}
              onPress={resetForm}
              title="Cancel"
              variant="secondary"
            />
          </View>
        </AppCard>
      ) : (
        <AppButton onPress={startAdding} title="Add application" />
      )}

      {!showForm && error ? <ErrorMessage message={error} /> : null}

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          message="Add your first job application using the button above."
        />
      ) : (
        <>
          <AppCard>
            <View style={styles.filterHeader}>
              <ThemedText type="subtitle">Search and filter</ThemedText>
              <AppButton
                onPress={() => setShowFilters((current) => !current)}
                title={showFilters ? 'Hide filters' : 'Show filters'}
                variant="secondary"
              />
            </View>

            {!showFilters ? (
              <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                {hasFilters
                  ? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`
                  : 'No filters applied'}
              </ThemedText>
            ) : (
              <View style={styles.form}>
                <FormField
                  autoCapitalize="none"
                  label="Search"
                  onChangeText={setSearchText}
                  placeholder="Company, role, or notes"
                  value={searchText}
                />

                <View style={styles.dateFilters}>
                  <FormField
                    label="From date"
                    onChangeText={setStartDateFilter}
                    placeholder="YYYY-MM-DD"
                    value={startDateFilter}
                    style={styles.dateInput}
                  />
                  <FormField
                    label="To date"
                    onChangeText={setEndDateFilter}
                    placeholder="YYYY-MM-DD"
                    value={endDateFilter}
                    style={styles.dateInput}
                  />
                </View>

                <View style={styles.optionGroup}>
                  <ThemedText type="defaultSemiBold">Category</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      <Pressable
                        accessibilityLabel="Show all categories"
                        accessibilityRole="button"
                        accessibilityState={{ selected: categoryFilterId === null }}
                        onPress={() => setCategoryFilterId(null)}
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor: categoryFilterId === null ? colors.tint : colors.surface,
                            borderColor: categoryFilterId === null ? colors.tint : colors.border,
                          },
                        ]}>
                        <ThemedText
                          style={[
                            styles.chipLabel,
                            { color: categoryFilterId === null ? Colors.dark.text : colors.text },
                          ]}>
                          All
                        </ThemedText>
                      </Pressable>

                      {categories.map((category) => {
                        const selected = category.id === categoryFilterId;

                        return (
                          <Pressable
                            accessibilityLabel={`Filter by ${category.name}`}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            key={category.id}
                            onPress={() => setCategoryFilterId(category.id)}
                            style={[
                              styles.categoryChip,
                              {
                                backgroundColor: selected ? category.color : colors.surface,
                                borderColor: selected ? category.color : colors.border,
                              },
                            ]}>
                            <MaterialIcons
                              color={selected ? Colors.dark.text : colors.text}
                              name={category.icon as CategoryIconName}
                              size={16}
                            />
                            <ThemedText
                              style={[
                                styles.chipLabel,
                                { color: selected ? Colors.dark.text : colors.text },
                              ]}>
                              {category.name}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                {hasFilters ? (
                  <AppButton onPress={clearFilters} title="Clear filters" variant="secondary" />
                ) : null}
              </View>
            )}
          </AppCard>

          <AppCard>
          <ThemedText type="subtitle">
            Applications ({filteredApplications.length} of {applications.length})
          </ThemedText>
          {filteredApplications.length === 0 ? (
            <ThemedText>No applications match the current filters.</ThemedText>
          ) : null}
          <View style={styles.list}>
            {filteredApplications.map((application) => {
              const category = categories.find((c) => c.id === application.category_id);
              const isSelected = selectedApplicationId === application.id;
              const statusLogs = statusLogsByApplicationId[application.id] ?? [];

              return (
                <View
                  key={application.id}
                  style={[styles.applicationItem, { borderColor: colors.border }]}>
                  <View style={styles.row}>
                    {category ? (
                      <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                        <MaterialIcons
                          color={Colors.dark.text}
                          name={category.icon as CategoryIconName}
                          size={18}
                        />
                      </View>
                    ) : null}

                    <Pressable
                      accessibilityLabel={`View status history for ${application.job_title} at ${application.company_name}`}
                      accessibilityRole="button"
                      onPress={() => toggleDetails(application)}
                      style={styles.rowText}>
                      <ThemedText type="defaultSemiBold">{application.company_name}</ThemedText>
                      <ThemedText>{application.job_title}</ThemedText>
                      <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                        {application.applied_date} - {statusLabels[application.current_status]}
                      </ThemedText>
                    </Pressable>

                    <View style={styles.rowActions}>
                      <Pressable
                        accessibilityLabel={`${isSelected ? 'Hide' : 'View'} ${application.job_title} status history`}
                        accessibilityRole="button"
                        onPress={() => toggleDetails(application)}
                        style={({ pressed }) => [
                          styles.iconButton,
                          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <MaterialIcons
                          color={colors.text}
                          name={isSelected ? 'expand-less' : 'expand-more'}
                          size={18}
                        />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Edit ${application.job_title} at ${application.company_name}`}
                        accessibilityRole="button"
                        onPress={() => startEditing(application)}
                        style={({ pressed }) => [
                          styles.iconButton,
                          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <MaterialIcons color={colors.text} name="edit" size={18} />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Delete ${application.job_title} at ${application.company_name}`}
                        accessibilityRole="button"
                        onPress={() => confirmDelete(application)}
                        style={({ pressed }) => [
                          styles.iconButton,
                          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <MaterialIcons color={colors.danger} name="delete" size={18} />
                      </Pressable>
                    </View>
                  </View>

                  {isSelected ? (
                    <View style={styles.detail}>
                      <View style={styles.detailRow}>
                        <ThemedText type="defaultSemiBold">Category</ThemedText>
                        <ThemedText>{category?.name ?? 'Unknown category'}</ThemedText>
                      </View>

                      {application.notes ? (
                        <View style={styles.detailRow}>
                          <ThemedText type="defaultSemiBold">Notes</ThemedText>
                          <ThemedText>{application.notes}</ThemedText>
                        </View>
                      ) : null}

                      <View style={styles.timeline}>
                        <ThemedText type="defaultSemiBold">Status history</ThemedText>
                        {statusLogs.length === 0 ? (
                          <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                            No status changes recorded yet.
                          </ThemedText>
                        ) : (
                          statusLogs.map((log) => (
                            <View key={log.id} style={styles.timelineItem}>
                              <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
                              <View style={styles.timelineText}>
                                <ThemedText type="defaultSemiBold">
                                  {statusLabels[log.status]}
                                </ThemedText>
                                <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                                  {log.changed_at.toLocaleDateString()}
                                </ThemedText>
                                {log.notes ? <ThemedText>{log.notes}</ThemedText> : null}
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </AppCard>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.md,
  },
  categoryBadge: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  categoryChip: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  applicationItem: {
    borderBottomWidth: 1,
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detail: {
    gap: Spacing.md,
    paddingLeft: 52,
  },
  detailRow: {
    gap: Spacing.xs,
  },
  dateFilters: {
    gap: Spacing.md,
  },
  dateInput: {
    minWidth: 140,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  form: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  list: {
    gap: Spacing.md,
  },
  optionGroup: {
    gap: Spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: Spacing.xs,
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  timeline: {
    gap: Spacing.sm,
  },
  timelineDot: {
    borderRadius: 5,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timelineText: {
    flex: 1,
    gap: Spacing.xs,
  },
});
