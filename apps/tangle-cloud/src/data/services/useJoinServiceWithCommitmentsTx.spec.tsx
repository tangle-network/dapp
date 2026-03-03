import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind } from '@tangle-network/tangle-shared-ui/data/services';
import { useJoinServiceWithCommitmentsTx } from './useJoinServiceWithCommitmentsTx';

const {
  mockUseChainId,
  mockGetContractsByChainId,
  mockUseContractWrite,
  mockUseQueryClient,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockUseChainId: vi.fn(),
  mockGetContractsByChainId: vi.fn(),
  mockUseContractWrite: vi.fn(),
  mockUseQueryClient: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock('wagmi', () => ({
  useChainId: () => mockUseChainId(),
}));

vi.mock('@tangle-network/dapp-config/contracts', () => ({
  getContractsByChainId: (chainId: number) =>
    mockGetContractsByChainId(chainId),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockUseQueryClient(),
}));

vi.mock('@tangle-network/tangle-shared-ui/hooks/useContractWrite', () => ({
  default: (...args: unknown[]) => mockUseContractWrite(...args),
  TxStatus: {
    NOT_YET_INITIATED: 'NOT_YET_INITIATED',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE',
    ERROR: 'ERROR',
  },
}));

const createMockHookResult = () => ({
  execute: vi.fn(),
  status: 'NOT_YET_INITIATED',
  error: null,
  reset: vi.fn(),
  txHash: null,
  isSuccess: false,
  isLoading: false,
});

describe('useJoinServiceWithCommitmentsTx', () => {
  const activeAddress = '0xabc0000000000000000000000000000000000000';

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainId.mockReturnValue(84532);
    mockGetContractsByChainId.mockReturnValue({
      tangle: '0x1234567890123456789012345678901234567890',
    });
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  it('uses joinServiceWithCommitments with service id, exposure, and mapped commitments', async () => {
    let capturedFactory:
      | ((params: any, activeAddress: any) => Promise<any>)
      | undefined;

    mockUseContractWrite.mockImplementation(
      (
        _abi: unknown,
        factory: (params: any, activeAddress: any) => Promise<any>,
      ) => {
        capturedFactory = factory;
        return createMockHookResult();
      },
    );

    renderHook(() => useJoinServiceWithCommitmentsTx());

    const commitments = [
      {
        asset: {
          kind: AssetKind.Erc20,
          token: '0x9999999999999999999999999999999999999999',
        },
        exposureBps: 3500,
      },
    ];

    const config = await capturedFactory?.(
      {
        serviceId: 11n,
        exposureBps: 9000,
        commitments,
      },
      activeAddress,
    );

    expect(config.functionName).toBe('joinServiceWithCommitments');
    expect(config.args).toEqual([11n, 9000, commitments]);
  });

  it('returns null tx config when contracts are unavailable', async () => {
    mockGetContractsByChainId.mockImplementation(() => {
      throw new Error('unsupported chain');
    });

    let capturedFactory:
      | ((params: any, activeAddress: any) => Promise<any>)
      | undefined;

    mockUseContractWrite.mockImplementation(
      (
        _abi: unknown,
        factory: (params: any, activeAddress: any) => Promise<any>,
      ) => {
        capturedFactory = factory;
        return createMockHookResult();
      },
    );

    renderHook(() => useJoinServiceWithCommitmentsTx());

    const config = await capturedFactory?.(
      {
        serviceId: 11n,
        exposureBps: 9000,
        commitments: [],
      },
      activeAddress,
    );

    expect(config).toBeNull();
  });

  it('invalidates service and exit queries after successful tx', () => {
    const onSuccess = vi.fn();
    let capturedOptions: { onSuccess?: () => void } | undefined;

    mockUseContractWrite.mockImplementation(
      (_abi: unknown, _factory: unknown, options: { onSuccess?: () => void }) => {
        capturedOptions = options;
        return createMockHookResult();
      },
    );

    renderHook(() => useJoinServiceWithCommitmentsTx({ onSuccess }));

    capturedOptions?.onSuccess?.();

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(3);
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ['serviceOperators'],
    });
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ['serviceDetails'],
    });
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: ['exitStatus'],
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
