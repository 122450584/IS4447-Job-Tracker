import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { type Category } from '@/db/schema';
import { useCategories } from '@/hooks/use-categories';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppButton } from './app-button';
import { AppCard } from './app-card';
import { ErrorMessage } from './error-message';
import { FormField } from './form-field';
import { ThemedText } from './themed-text';

type CategoryManagerProps = {
  userId: number;
};

type CategoryIconName = keyof typeof MaterialIcons.glyphMap;

const colorOptions = [
  { label: 'Green', value: '#1E5B4F' },
  { label: 'Blue', value: '#2F6FED' },
  { label: 'Amber', value: '#B7791F' },
  { label: 'Purple', value: '#7C3AED' },
  { label: 'Red', value: '#B42318' },
] as const;

const iconOptions: { label: string; value: CategoryIconName }[] = [
  { label: 'Work', value: 'work' },
  { label: 'Code', value: 'code' },
  { label: 'Analytics', value: 'bar-chart' },
  { label: 'Education', value: 'school' },
  { label: 'Remote', value: 'home' },
];

export function CategoryManager({ userId }: CategoryManagerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { addCategory, categories, editCategory, error, isLoading } = useCategories(userId);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(colorOptions[0].value);
  const [icon, setIcon] = useState<CategoryIconName>(iconOptions[0].value);

  const isEditing = editingCategoryId !== null;

  function resetForm() {
    setEditingCategoryId(null);
    setName('');
    setColor(colorOptions[0].value);
    setIcon(iconOptions[0].value);
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category.id);
    setName(category.name);
    setColor(category.color);
    setIcon(category.icon as CategoryIconName);
  }

  async function handleSave() {
    try {
      if (isEditing) {
        await editCategory({
          id: editingCategoryId,
          name,
          color,
          icon,
        });
      } else {
        await addCategory({
          name,
          color,
          icon,
        });
      }

      resetForm();
    } catch {
      return;
    }
  }

  return (
    <>
      <AppCard>
        <ThemedText type="subtitle">{isEditing ? 'Edit category' : 'Add category'}</ThemedText>

        <View style={styles.form}>
          <FormField
            label="Category name"
            onChangeText={setName}
            placeholder="Software Engineering"
            value={name}
          />

          <View style={styles.optionGroup}>
            <ThemedText type="defaultSemiBold">Colour</ThemedText>
            <View style={styles.swatchRow}>
              {colorOptions.map((option) => {
                const selected = option.value === color;

                return (
                  <Pressable
                    accessibilityLabel={`Use ${option.label} category colour`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option.value}
                    onPress={() => setColor(option.value)}
                    style={[
                      styles.swatchButton,
                      {
                        backgroundColor: option.value,
                        borderColor: selected ? colors.text : colors.border,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <ThemedText type="defaultSemiBold">Icon</ThemedText>
            <View style={styles.iconRow}>
              {iconOptions.map((option) => {
                const selected = option.value === icon;

                return (
                  <Pressable
                    accessibilityLabel={`Use ${option.label} category icon`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option.value}
                    onPress={() => setIcon(option.value)}
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: selected ? colors.tint : colors.surface,
                        borderColor: selected ? colors.tint : colors.border,
                      },
                    ]}>
                    <MaterialIcons
                      color={selected ? Colors.dark.text : colors.text}
                      name={option.value}
                      size={22}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <View style={styles.actions}>
          <AppButton
            loading={isLoading}
            onPress={handleSave}
            title={isEditing ? 'Save changes' : 'Add category'}
          />
          {isEditing ? (
            <AppButton disabled={isLoading} onPress={resetForm} title="Cancel" variant="secondary" />
          ) : null}
        </View>
      </AppCard>

      <AppCard>
        <ThemedText type="subtitle">Categories</ThemedText>

        {categories.length === 0 ? (
          <ThemedText>No categories yet. Add a category before recording applications.</ThemedText>
        ) : (
          <View style={styles.categoryList}>
            {categories.map((category) => (
              <View
                key={category.id}
                style={[styles.categoryRow, { borderColor: colors.border }]}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <MaterialIcons
                    color={Colors.dark.text}
                    name={category.icon as CategoryIconName}
                    size={22}
                  />
                </View>

                <View style={styles.categoryText}>
                  <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
                    {category.name}
                  </ThemedText>
                  <ThemedText style={{ color: colors.text }}>
                    {category.color}
                  </ThemedText>
                </View>

                <Pressable
                  accessibilityLabel={`Edit ${category.name}`}
                  accessibilityRole="button"
                  onPress={() => startEditing(category)}
                  style={({ pressed }) => [
                    styles.editButton,
                    {
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <MaterialIcons color={colors.text} name="edit" size={20} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.md,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  categoryList: {
    gap: Spacing.md,
  },
  categoryRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  categoryText: {
    flex: 1,
    gap: Spacing.xs,
  },
  editButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  form: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  optionGroup: {
    gap: Spacing.sm,
  },
  swatchButton: {
    borderRadius: 22,
    borderWidth: 3,
    height: 44,
    width: 44,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
