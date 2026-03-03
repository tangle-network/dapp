import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaveServiceTx } from './useLeaveServiceTx';

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

describe('useLeaveServiceTx', () => {
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

  it('uses leaveService with service id args', async () => {
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

    renderHook(() => useLeaveServiceTx());

    const config = await capturedFactory?.(
      {
        serviceId: 12n,
      },
      activeAddress,
    );

    expect(config.functionName).toBe('leaveService');
    expect(config.args).toEqual([12n]);
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

    renderHook(() => useLeaveServiceTx());

    const config = await capturedFactory?.(
      {
        serviceId: 12n,
      },
      activeAddress,
    );

    expect(config).toBeNull();
  });

  it('invalidates service and exit queries after successful tx', () => {
    const onSuccess = vi.fn();
    let capturedOptions: { onSuccess?: () => void } | undefined;

    mockUseContractWrite.mockImplementation(
      (
        _abi: unknown,
        _factory: unknown,
        options: { onSuccess?: () => void },
      ) => {
        capturedOptions = options;
        return createMockHookResult();
      },
    );

    renderHook(() => useLeaveServiceTx({ onSuccess }));

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
