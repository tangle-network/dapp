import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useForceExitTx } from './useForceExitTx';

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

describe('useForceExitTx', () => {
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

  it('uses forceExit with service id and operator args', async () => {
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

    renderHook(() => useForceExitTx());

    const config = await capturedFactory?.(
      {
        serviceId: 16n,
        operator: '0x1111111111111111111111111111111111111111',
      },
      activeAddress,
    );

    expect(config.functionName).toBe('forceExit');
    expect(config.args).toEqual([
      16n,
      '0x1111111111111111111111111111111111111111',
    ]);
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

    renderHook(() => useForceExitTx());

    const config = await capturedFactory?.(
      {
        serviceId: 16n,
        operator: '0x1111111111111111111111111111111111111111',
      },
      activeAddress,
    );

    expect(config).toBeNull();
  });

  it('invalidates exit and service queries after successful tx', () => {
    const onSuccess = vi.fn();
    let capturedOptions: { onSuccess?: () => void } | undefined;

    mockUseContractWrite.mockImplementation(
      (_abi: unknown, _factory: unknown, options: { onSuccess?: () => void }) => {
        capturedOptions = options;
        return createMockHookResult();
      },
    );

    renderHook(() => useForceExitTx({ onSuccess }));

    capturedOptions?.onSuccess?.();

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(4);
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ['exitStatus'],
    });
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ['exitRequest'],
    });
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(3, {
      queryKey: ['serviceOperators'],
    });
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(4, {
      queryKey: ['serviceDetails'],
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
