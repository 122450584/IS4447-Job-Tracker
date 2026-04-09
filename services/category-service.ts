import { and, asc, eq, ne } from 'drizzle-orm';

import { db } from '@/db/client';
import { initializeDatabase } from '@/db/init';
import { type Category, categories } from '@/db/schema';

export type CategoryInput = {
  userId: number;
  name: string;
  color: string;
  icon: string;
};

export type UpdateCategoryInput = CategoryInput & {
  id: number;
};

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
  initializeDatabase();

  return db
    .select()
    .from(categories)
    .where(eq(categories.user_id, userId))
    .orderBy(asc(categories.name))
    .all();
}

export function createCategory(input: CategoryInput): Category {
  initializeDatabase();

  const values = cleanCategoryInput(input);
  const duplicate = db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.user_id, values.userId), eq(categories.name, values.name)))
    .get();

  if (duplicate) {
    throw new Error('A category with this name already exists.');
  }

  return db
    .insert(categories)
    .values({
      user_id: values.userId,
      name: values.name,
      color: values.color,
      icon: values.icon,
    })
    .returning()
    .get();
}

export function updateCategory(input: UpdateCategoryInput): Category {
  initializeDatabase();

  const values = cleanCategoryInput(input);
  const duplicate = db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.user_id, values.userId),
        eq(categories.name, values.name),
        ne(categories.id, input.id)
      )
    )
    .get();

  if (duplicate) {
    throw new Error('A category with this name already exists.');
  }

  const updatedCategory = db
    .update(categories)
    .set({
      name: values.name,
      color: values.color,
      icon: values.icon,
      updated_at: new Date(),
    })
    .where(and(eq(categories.id, input.id), eq(categories.user_id, values.userId)))
    .returning()
    .get();

  if (!updatedCategory) {
    throw new Error('Category was not found.');
  }

  return updatedCategory;
}
