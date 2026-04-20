import { seedDatabase } from '@/db/seed';

let hasInitializedSeed = false;

export function initializeSeedData() {
  if (hasInitializedSeed) {
    return;
  }

  seedDatabase();
  hasInitializedSeed = true;
}
