import { describe, it, expect, vi, beforeEach } from 'vitest';
import { opportunityService } from '../opportunityService';

// Mocks for Supabase operations
const updatedOpportunity = {
  id: '1',
  name: 'Test Opp',
  account_id: 'acc1',
  value: 100,
  stage: 'ready_for_proposal',
  probability: 50,
  client_leader_id: 'leader1',
  expected_confirmation_date: null,
  created_at: '',
  updated_at: '',
  notes: '',
  source: '',
  competitor: null,
  lost_reason: null,
};

const updateSingleMock = vi.fn().mockResolvedValue({ data: updatedOpportunity, error: null });
const updateSelectMock = vi.fn(() => ({ single: updateSingleMock }));
const eqMock = vi.fn(() => ({ select: updateSelectMock }));
const updateMock = vi.fn(() => ({ eq: eqMock }));

const insertSingleMock = vi.fn().mockResolvedValue({ data: { id: 'job1' }, error: null });
const insertSelectMock = vi.fn(() => ({ single: insertSingleMock }));
const insertMock = vi.fn(() => ({ select: insertSelectMock }));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'opportunities') {
        return { update: updateMock };
      }
      if (table === 'jobs') {
        return { insert: insertMock };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  },
  logActivity: vi.fn(),
  handleSupabaseError: vi.fn((e) => e),
}));

describe('opportunityService.update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a job when stage is ready_for_proposal', async () => {
    await opportunityService.update('1', { stage: 'ready_for_proposal' } as any);
    expect(insertMock).toHaveBeenCalled();
  });
});
