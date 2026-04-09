import { type Category } from '@/db/schema';

export type CategoryInput = {
  userId: number;
  name: string;
  color: string;
  icon: string;
};

export type UpdateCategoryInput = CategoryInput & {
  id: number;
};

type StoredCategory = Omit<Category, 'created_at' | 'updated_at'> & {
  created_at: string;
  updated_at: string;
};

const categoriesStorageKey = 'job_tracker_categories';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function toCategory(category: StoredCategory): Category {
  return {
    ...category,
    created_at: new Date(category.created_at),
    updated_at: new Date(category.updated_at),
  };
}

function toStoredCategory(category: Category): StoredCategory {
  return {
    ...category,
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
  };
}

function readCategories(): Category[] {
  if (!canUseStorage()) {
    return [];
  }

  const storedCategories = window.localStorage.getItem(categoriesStorageKey);

  if (!storedCategories) {
    return [];
  }

  try {
    return (JSON.parse(storedCategories) as StoredCategory[]).map(toCategory);
  } catch {
    return [];
  }
}

function writeCategories(categories: Category[]) {
  if (canUseStorage()) {
    window.localStorage.setItem(
      categoriesStorageKey,
      JSON.stringify(categories.map(toStoredCategory))
    );
  }
}

function cleanCategoryInput(input: CategoryInput) {
  const name = input.name.trim();
  const color = input.color.trim();
  const icon = input.icon.trim();

  if (!name) {
    throw new Error('Category name is required.');
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error('Choose a valid category colour.');
  }

  if (!icon) {
    throw new Error('Choose a category icon.');
  }

  return {
    userId: input.userId,
    name,
    color,
    icon,
  };
}

export function listCategories(userId: number): Category[] {
  return readCategories()
    .filter((category) => category.user_id === userId)
    .sort((firstCategory, secondCategory) => firstCategory.name.localeCompare(secondCategory.name));
}

export function createCategory(input: CategoryInput): Category {
  const values = cleanCategoryInput(input);
  const storedCategories = readCategories();
  const duplicate = storedCategories.some(
    (category) => category.user_id === values.userId && category.name === values.name
  );

  if (duplicate) {
    throw new Error('A category with this name already exists.');
  }

  const now = new Date();
  const category: Category = {
    id: Date.now(),
    user_id: values.userId,
    name: values.name,
    color: values.color,
    icon: values.icon,
    created_at: now,
    updated_at: now,
  };

  writeCategories([...storedCategories, category]);

  return category;
}

export function updateCategory(input: UpdateCategoryInput): Category {
  const values = cleanCategoryInput(input);
  const storedCategories = readCategories();
  const duplicate = storedCategories.some(
    (category) =>
      category.user_id === values.userId &&
      category.name === values.name &&
      category.id !== input.id
  );

  if (duplicate) {
    throw new Error('A category with this name already exists.');
  }

  const existingCategory = storedCategories.find(
    (category) => category.id === input.id && category.user_id === values.userId
  );

  if (!existingCategory) {
    throw new Error('Category was not found.');
  }

  const updatedCategory: Category = {
    ...existingCategory,
    name: values.name,
    color: values.color,
    icon: values.icon,
    updated_at: new Date(),
  };

  writeCategories(
    storedCategories.map((category) =>
      category.id === updatedCategory.id ? updatedCategory : category
    )
  );

  return updatedCategory;
}
