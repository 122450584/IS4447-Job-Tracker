import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { type PeriodType, type Target } from '@/db/schema';
import { useCategories } from '@/hooks/use-categories';
import { useTargets } from '@/hooks/use-targets';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppButton } from './app-button';
import { AppCard } from './app-card';
import { EmptyState } from './empty-state';
import { ErrorMessage } from './error-message';
import { FormField } from './form-field';
import { ThemedText } from './themed-text';

type TargetManagerProps = {
  userId: number;
};

type TargetPeriod = Extract<PeriodType, 'weekly' | 'monthly'>;
type CategoryIconName = keyof typeof MaterialIcons.glyphMap;

const periodOptions: { label: string; value: TargetPeriod }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const stateLabels = {
  exceeded: 'Exceeded',
  met: 'Met',
  unmet: 'Unmet',
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function defaultEndDate(periodType: TargetPeriod) {
  const date = new Date();
  date.setDate(date.getDate() + (periodType === 'weekly' ? 6 : 29));
  return date.toISOString().slice(0, 10);
}

export function TargetManager({ userId }: TargetManagerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { categories } = useCategories(userId);
  const { addTarget, editTarget, error, isLoading, removeTarget, targets } = useTargets(userId);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [periodType, setPeriodType] = useState<TargetPeriod>('weekly');
  const [targetValue, setTargetValue] = useState('5');
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(defaultEndDate('weekly'));

  const isEditing = editingId !== null;

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setCategoryId(null);
    setPeriodType('weekly');
    setTargetValue('5');
    setStartDate(todayString());
    setEndDate(defaultEndDate('weekly'));
  }

  function startAdding() {
    resetForm();
    setShowForm(true);
  }

  function startEditing(target: Target) {
    const nextPeriodType = target.period_type === 'monthly' ? 'monthly' : 'weekly';

    setEditingId(target.id);
    setCategoryId(target.category_id);
    setPeriodType(nextPeriodType);
    setTargetValue(String(target.target_value));
    setStartDate(target.start_date);
    setEndDate(target.end_date);
    setShowForm(true);
  }

  function choosePeriod(nextPeriodType: TargetPeriod) {
    setPeriodType(nextPeriodType);

    if (!isEditing) {
      setEndDate(defaultEndDate(nextPeriodType));
    }
  }

  function confirmDelete(target: Target) {
    const message = `Delete the ${target.period_type} target from ${target.start_date} to ${target.end_date}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        removeTarget(target.id);
      }
      return;
    }

    Alert.alert('Delete target', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTarget(target.id) },
    ]);
  }

  async function handleSave() {
    try {
      const input = {
        categoryId,
        periodType,
        targetValue: Number(targetValue),
        startDate,
        endDate,
      };

      if (isEditing) {
        await editTarget({ ...input, id: editingId });
      } else {
        await addTarget(input);
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
          <ThemedText type="subtitle">{isEditing ? 'Edit target' : 'Add target'}</ThemedText>

          <View style={styles.form}>
            <View style={styles.optionGroup}>
              <ThemedText type="defaultSemiBold">Period</ThemedText>
              <View style={styles.chipRow}>
                {periodOptions.map((option) => {
                  const selected = option.value === periodType;

                  return (
                    <Pressable
                      accessibilityLabel={`Use ${option.label} target period`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={option.value}
                      onPress={() => choosePeriod(option.value)}
                      style={[
                        styles.chip,
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
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <FormField
              keyboardType="number-pad"
              label="Target applications"
              onChangeText={setTargetValue}
              placeholder="5"
              value={targetValue}
            />

            <View style={styles.dateInputs}>
              <FormField
                label="Start date"
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                value={startDate}
              />
              <FormField
                label="End date"
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                value={endDate}
              />
            </View>

            <View style={styles.optionGroup}>
              <ThemedText type="defaultSemiBold">Scope</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  <Pressable
                    accessibilityLabel="Use global target scope"
                    accessibilityRole="button"
                    accessibilityState={{ selected: categoryId === null }}
                    onPress={() => setCategoryId(null)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: categoryId === null ? colors.tint : colors.surface,
                        borderColor: categoryId === null ? colors.tint : colors.border,
                      },
                    ]}>
                    <ThemedText
                      style={[
                        styles.chipLabel,
                        { color: categoryId === null ? Colors.dark.text : colors.text },
                      ]}>
                      Global
                    </ThemedText>
                  </Pressable>

                  {categories.map((category) => {
                    const selected = category.id === categoryId;

                    return (
                      <Pressable
                        accessibilityLabel={`Use ${category.name} target scope`}
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
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <View style={styles.actions}>
            <AppButton
              loading={isLoading}
              onPress={handleSave}
              title={isEditing ? 'Save changes' : 'Add target'}
            />
            <AppButton disabled={isLoading} onPress={resetForm} title="Cancel" variant="secondary" />
          </View>
        </AppCard>
      ) : (
        <AppButton onPress={startAdding} title="Add target" />
      )}

      {!showForm && error ? <ErrorMessage message={error} /> : null}

      {targets.length === 0 ? (
        <EmptyState
          title="No targets set"
          message="Add a weekly or monthly goal to track application progress."
        />
      ) : (
        <View style={styles.targetList}>
          {targets.map((targetProgress) => {
            const category = categories.find(
              (categoryItem) => categoryItem.id === targetProgress.target.category_id
            );
            const progressPercent = Math.round(targetProgress.progressRatio * 100);

            return (
              <AppCard key={targetProgress.target.id}>
                <View style={styles.targetHeader}>
                  <View style={styles.targetTitle}>
                    <ThemedText type="subtitle">
                      {targetProgress.target.period_type === 'weekly' ? 'Weekly' : 'Monthly'} target
                    </ThemedText>
                    <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                      {category?.name ?? 'Global'} - {targetProgress.target.start_date} to{' '}
                      {targetProgress.target.end_date}
                    </ThemedText>
                  </View>

                  <View style={styles.targetActions}>
                    <Pressable
                      accessibilityLabel="Edit target"
                      accessibilityRole="button"
                      onPress={() => startEditing(targetProgress.target)}
                      style={({ pressed }) => [
                        styles.iconButton,
                        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                      ]}>
                      <MaterialIcons color={colors.text} name="edit" size={18} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Delete target"
                      accessibilityRole="button"
                      onPress={() => confirmDelete(targetProgress.target)}
                      style={({ pressed }) => [
                        styles.iconButton,
                        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                      ]}>
                      <MaterialIcons color={colors.danger} name="delete" size={18} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor:
                          targetProgress.state === 'unmet' ? colors.tint : '#2E7D32',
                        width: `${progressPercent}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressStats}>
                  <ThemedText>
                    {targetProgress.completed} of {targetProgress.target.target_value} applications
                  </ThemedText>
                  <ThemedText lightColor={Colors.light.muted} darkColor={Colors.dark.muted}>
                    {targetProgress.remaining === 0
                      ? `${stateLabels[targetProgress.state]}`
                      : `${targetProgress.remaining} remaining`}
                  </ThemedText>
                </View>
              </AppCard>
            );
          })}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.md,
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
  chip: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dateInputs: {
    gap: Spacing.md,
  },
  form: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  optionGroup: {
    gap: Spacing.sm,
  },
  progressFill: {
    borderRadius: Radius.sm,
    height: '100%',
  },
  progressStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  progressTrack: {
    backgroundColor: '#D9E4DF',
    borderRadius: Radius.sm,
    height: 10,
    overflow: 'hidden',
  },
  targetActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  targetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  targetList: {
    gap: Spacing.lg,
  },
  targetTitle: {
    flex: 1,
    gap: Spacing.xs,
  },
});
