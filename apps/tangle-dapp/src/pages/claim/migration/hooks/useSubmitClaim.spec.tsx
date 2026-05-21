import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Hex } from 'viem';

const mockUseAccount = vi.fn();
const mockUseChainId = vi.fn();
const mockUseWriteContract = vi.fn();
const mockUseWaitForTransactionReceipt = vi.fn();
const mockGetMigrationContractsByChainId = vi.fn();
const mockWriteContractAsync = vi.fn();
const mockResetWrite = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useChainId: () => mockUseChainId(),
  useWriteContract: () => mockUseWriteContract(),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
}));

vi.mock('@tangle-network/dapp-config/contracts', () => ({
  getMigrationContractsByChainId: (chainId: number) =>
    mockGetMigrationContractsByChainId(chainId),
}));

const baseArgs = {
  ss58Address: '5D4dNuQY3m7D19w2b8iQkRrrq7V9n8t1zQ8yRxnq7R6YQabc',
  pubkey: `0x${'11'.repeat(32)}` as Hex,
  amount: 10n,
  merkleProof: [`0x${'22'.repeat(32)}` as Hex],
  zkProof: '0x1234' as Hex,
  recipient: '0xabc0000000000000000000000000000000000000' as Hex,
};

const loadHook = async () => {
  const mod = await import('./useSubmitClaim');
  return mod.default;
};

describe('useSubmitClaim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();

    mockUseAccount.mockReturnValue({
      address: '0xabc0000000000000000000000000000000000000',
    });
    mockUseChainId.mockReturnValue(84532);
    mockUseWriteContract.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
      reset: mockResetWrite,
      writeContractAsync: mockWriteContractAsync,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      error: null,
    });
    mockGetMigrationContractsByChainId.mockReturnValue({
      migrationClaim: '0x1234567890123456789012345678901234567890',
    });
    mockWriteContractAsync.mockResolvedValue('0xhash');
  });

  it('switches from relayer to wallet mode on relayer network failure', async () => {
    vi.stubEnv('VITE_CLAIM_RELAYER_URL', 'https://relayer.example');
    vi.stubEnv(
      'VITE_TANGLE_MIGRATION_ADDRESS',
      '0x1234567890123456789012345678901234567890',
    );

    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    global.fetch = fetchMock as any;

    const useSubmitClaim = await loadHook();
    const { result } = renderHook(() => useSubmitClaim());

    await act(async () => {
      await expect(
        result.current.submitClaim(baseArgs),
      ).resolves.toBeUndefined();
    });

    expect(mockWriteContractAsync).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await expect(
        result.current.submitClaim(baseArgs),
      ).resolves.toBeUndefined();
    });

    expect(mockWriteContractAsync).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when relayer response does not include txHash', async () => {
    vi.stubEnv('VITE_CLAIM_RELAYER_URL', 'https://relayer.example');
    vi.stubEnv(
      'VITE_TANGLE_MIGRATION_ADDRESS',
      '0x1234567890123456789012345678901234567890',
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock as any;

    const useSubmitClaim = await loadHook();
    const { result } = renderHook(() => useSubmitClaim());

    await act(async () => {
      await expect(result.current.submitClaim(baseArgs)).rejects.toThrow(
        'Relayer response missing transaction hash',
      );
    });

    expect(result.current.txHash).toBeNull();
    expect(result.current.isConfirmed).toBe(false);
    expect(mockWriteContractAsync).not.toHaveBeenCalled();
  });

  it('does not mark relayer submission as confirmed before receipt success', async () => {
    vi.stubEnv('VITE_CLAIM_RELAYER_URL', 'https://relayer.example');
    vi.stubEnv(
      'VITE_TANGLE_MIGRATION_ADDRESS',
      '0x1234567890123456789012345678901234567890',
    );

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      error: null,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ txHash: '0xfeed' }),
    });
    global.fetch = fetchMock as any;

    const useSubmitClaim = await loadHook();
    const { result } = renderHook(() => useSubmitClaim());

    await act(async () => {
      await result.current.submitClaim(baseArgs);
    });

    expect(result.current.txHash).toBe('0xfeed');
    expect(result.current.isConfirmed).toBe(false);
    expect(mockWriteContractAsync).not.toHaveBeenCalled();
  });

  it('throws when migration contract is not configured', async () => {
    vi.stubEnv(
      'VITE_TANGLE_MIGRATION_ADDRESS',
      '0x0000000000000000000000000000000000000000',
    );
    vi.stubEnv('VITE_CLAIM_RELAYER_URL', '');
    mockGetMigrationContractsByChainId.mockReturnValue(null);

    const useSubmitClaim = await loadHook();
    const { result } = renderHook(() => useSubmitClaim());

    await expect(result.current.submitClaim(baseArgs)).rejects.toThrow(
      'TangleMigration contract not configured',
    );
  });
});
