import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { type Category } from '@/db/schema';
import {
  type CategoryInput,
  createCategory,
  listCategories,
  updateCategory,
  type UpdateCategoryInput,
} from '@/services/category-service';

export function useCategories(userId: number | null | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reloadCategories = useCallback(() => {
    if (!userId) {
      setCategories([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCategories(listCategories(userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Categories could not be loaded.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reloadCategories();
  }, [reloadCategories]);

  useFocusEffect(
    useCallback(() => {
      reloadCategories();
    }, [reloadCategories])
  );

  const addCategory = useCallback(
    async (input: Omit<CategoryInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Log in before creating categories.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const category = createCategory({ ...input, userId });
        setCategories(listCategories(userId));
        return category;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Category could not be created.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const editCategory = useCallback(
    async (input: Omit<UpdateCategoryInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Log in before editing categories.');
      }

      setIsLoading(true);
      setError(null);

      try {
        const category = updateCategory({ ...input, userId });
        setCategories(listCategories(userId));
        return category;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Category could not be updated.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    addCategory,
    categories,
    editCategory,
    error,
    isLoading,
    reloadCategories,
  };
}
