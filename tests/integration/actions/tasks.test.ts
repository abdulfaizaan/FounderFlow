import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteTask } from '@/lib/actions/tasks';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getActiveStartupIdForUser } from '@/lib/startup-context';

vi.mock('@/lib/startup-context', () => ({
  getActiveStartupIdForUser: vi.fn(),
}));

describe('deleteTask Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow a user to delete their own task', async () => {
    const mockUserId = 'user_a';
    const mockStartupId = 'startup_a';
    const mockTaskId = 'task_a';

    (auth as any).mockResolvedValue({ userId: mockUserId });
    (getActiveStartupIdForUser as any).mockResolvedValue({
      startupId: mockStartupId,
      founder: { id: 'founder_a' },
    });

    (prisma.task.findFirst as any).mockResolvedValue({ id: mockTaskId });
    (prisma.task.update as any).mockResolvedValue({ id: mockTaskId, status: 'ARCHIVED' });

    await expect(deleteTask(mockTaskId)).resolves.not.toThrow();
    expect(prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockTaskId },
        data: { status: 'ARCHIVED' },
      })
    );
  });

  it('should throw "Task not found" when trying to delete a task from another startup', async () => {
    const mockUserId = 'user_a';
    const mockStartupId = 'startup_a';
    const victimTaskId = 'task_b';

    (auth as any).mockResolvedValue({ userId: mockUserId });
    (getActiveStartupIdForUser as any).mockResolvedValue({
      startupId: mockStartupId,
      founder: { id: 'founder_a' },
    });

    // Simulate findOwnedTask returning null because the task belongs to startup_b
    (prisma.task.findFirst as any).mockResolvedValue(null);

    await expect(deleteTask(victimTaskId)).rejects.toThrow('Task not found');
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('should throw "Unauthorized" when not logged in', async () => {
    (auth as any).mockResolvedValue({ userId: null });

    await expect(deleteTask('any-id')).rejects.toThrow('Unauthorized');
  });
});
