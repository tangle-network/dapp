import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useServiceRejectTx } from './useServiceRejectTx';

const { mockUseChainId, mockGetContractsByChainId, mockUseContractWrite } =
  vi.hoisted(() => ({
    mockUseChainId: vi.fn(),
    mockGetContractsByChainId: vi.fn(),
    mockUseContractWrite: vi.fn(),
  }));

vi.mock('wagmi', () => ({
  useChainId: () => mockUseChainId(),
}));

vi.mock('@tangle-network/dapp-config/contracts', () => ({
  getContractsByChainId: (chainId: number) =>
    mockGetContractsByChainId(chainId),
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

describe('useServiceRejectTx', () => {
  const activeAddress = '0xabc0000000000000000000000000000000000000';

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseChainId.mockReturnValue(84532);
    mockGetContractsByChainId.mockReturnValue({
      tangle: '0x1234567890123456789012345678901234567890',
    });
  });

  it('uses rejectService with request id args', async () => {
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

    renderHook(() => useServiceRejectTx());

    const config = await capturedFactory?.(
      {
        requestId: 17n,
      },
      activeAddress,
    );

    expect(config.functionName).toBe('rejectService');
    expect(config.args).toEqual([17n]);
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

    renderHook(() => useServiceRejectTx());

    const config = await capturedFactory?.(
      {
        requestId: 17n,
      },
      activeAddress,
    );

    expect(config).toBeNull();
  });

  it('passes through callback options to contract write config', () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    let capturedOptions:
      | { onSuccess?: () => void; onError?: (error: Error) => void }
      | undefined;

    mockUseContractWrite.mockImplementation(
      (
        _abi: unknown,
        _factory: unknown,
        options: { onSuccess?: () => void; onError?: (error: Error) => void },
      ) => {
        capturedOptions = options;
        return createMockHookResult();
      },
    );

    renderHook(() => useServiceRejectTx({ onSuccess, onError }));

    capturedOptions?.onSuccess?.();
    capturedOptions?.onError?.(new Error('mock error'));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
