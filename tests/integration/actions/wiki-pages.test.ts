import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWikiPage, updateWikiPage, deleteWikiPage } from '@/lib/actions/wiki';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getActiveStartupIdForUser } from '@/lib/startup-context';

vi.mock('@/lib/startup-context', () => ({
  getActiveStartupIdForUser: vi.fn(),
}));

describe('Wiki Page Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow a user to create a page in their own startup', async () => {
    const mockUserId = 'user_a';
    const mockStartupId = 'startup_a';

    (auth as any).mockResolvedValue({ userId: mockUserId });
    (getActiveStartupIdForUser as any).mockResolvedValue({
      startupId: mockStartupId,
      founder: { id: 'founder_a' },
    });

    (prisma.wikiPage.create as any).mockResolvedValue({ id: 'page_a', title: 'Test' });

    await expect(createWikiPage({ title: 'Test', content: 'Content' })).resolves.toBeDefined();
    expect(prisma.wikiPage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ startupId: mockStartupId }),
      })
    );
  });

  it('should prevent updating a page belonging to another startup', async () => {
    const mockUserId = 'user_a';
    const mockStartupId = 'startup_a';
    const victimPageId = 'page_b';

    (auth as any).mockResolvedValue({ userId: mockUserId });
    (getActiveStartupIdForUser as any).mockResolvedValue({
      startupId: mockStartupId,
      founder: { id: 'founder_a' },
    });

    (prisma.wikiPage.update as any).mockRejectedValue(new Error('Record not found'));

    await expect(updateWikiPage(victimPageId, { title: 'Hacked' }))
      .rejects.toThrow();

    expect(prisma.wikiPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: victimPageId, startupId: mockStartupId },
      })
    );
  });

  it('should prevent deleting a page belonging to another startup', async () => {
    const mockUserId = 'user_a';
    const mockStartupId = 'startup_a';
    const victimPageId = 'page_b';

    (auth as any).mockResolvedValue({ userId: mockUserId });
    (getActiveStartupIdForUser as any).mockResolvedValue({
      startupId: mockStartupId,
      founder: { id: 'founder_a' },
    });

    (prisma.wikiPage.delete as any).mockRejectedValue(new Error('Record not found'));

    await expect(deleteWikiPage(victimPageId)).rejects.toThrow();
    expect(prisma.wikiPage.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: victimPageId, startupId: mockStartupId },
      })
    );
  });
});
