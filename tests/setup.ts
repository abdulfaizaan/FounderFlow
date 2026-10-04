import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      update: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    startup: {
      findUnique: vi.fn(),
    },
    founder: {
      findUnique: vi.fn(),
    },
    milestone: {
      findMany: vi.fn(),
    },
    goal: {
      findUnique: vi.fn(),
    },
    lead: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    wikiPage: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    wikiFolder: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock Analytics
vi.mock('@/lib/analytics', () => ({
  track: vi.fn().mockResolvedValue(undefined),
}));
