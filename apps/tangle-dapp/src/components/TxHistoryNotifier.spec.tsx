import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TxName } from '../constants';
import TxHistoryNotifier from './TxHistoryNotifier';

type TxState = {
  transactions: Array<{
    hash: string;
    name: string;
    status: 'pending' | 'inblock' | 'finalized' | 'failed';
    origin: string;
    network: string;
    timestamp: number;
    errorMessage?: string;
  }>;
};

const mockEnqueueSnackbar = vi.fn();
const mockCloseSnackbar = vi.fn();
const mockUseEvmAddress = vi.fn();

let txState: TxState = { transactions: [] };
let activeAddress = '0xabc0000000000000000000000000000000000000';

vi.mock('@tangle-network/icons', () => ({
  ExternalLinkLine: () => null,
}));

vi.mock('@tangle-network/ui-components', () => ({
  Button: ({ children }: { children: unknown }) => children,
  CopyWithTooltip: () => null,
  Typography: ({ children }: { children: unknown }) => children,
  isEvmAddress: (value: string) => value.startsWith('0x'),
  shortenHex: (value: string) => value,
}));

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
    closeSnackbar: mockCloseSnackbar,
  }),
}));

vi.mock('@tangle-network/tangle-shared-ui/context/useNetworkStore', () => ({
  default: (selector: (state: { network2: any }) => any) =>
    selector({
      network2: {
        id: 'base-sepolia',
        createExplorerTxUrl: (_isTx: boolean, hash: string) =>
          new URL(`https://explorer.example/tx/${hash}`),
      },
    }),
}));

vi.mock('@tangle-network/tangle-shared-ui/context/useTxHistoryStore', () => ({
  default: (selector: (state: TxState) => any) => selector(txState),
}));

vi.mock('@tangle-network/tangle-shared-ui/hooks/useEvmAddress', () => ({
  default: () => mockUseEvmAddress(),
}));

describe('TxHistoryNotifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activeAddress = '0xabc0000000000000000000000000000000000000';
    mockUseEvmAddress.mockImplementation(() => activeAddress);
    txState = { transactions: [] };
  });

  it('does not notify for initial local-storage hydration state', () => {
    txState = {
      transactions: [
        {
          hash: '0xhash-hydrated',
          name: TxName.STAKING_DEPOSIT,
          status: 'pending',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    render(<TxHistoryNotifier />);

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
    expect(mockCloseSnackbar).not.toHaveBeenCalled();
  });

  it('notifies when a pending transaction appears after initialization', () => {
    const { rerender } = render(<TxHistoryNotifier />);

    txState = {
      transactions: [
        {
          hash: '0xhash-pending',
          name: TxName.STAKING_DELEGATE,
          status: 'pending',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    rerender(<TxHistoryNotifier />);

    expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        key: '0xhash-pending',
        variant: 'info',
        persist: true,
      }),
    );
  });

  it('closes pending notification and emits success notification on finalize', () => {
    txState = {
      transactions: [
        {
          hash: '0xhash-finalize',
          name: TxName.STAKING_DELEGATE,
          status: 'pending',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    const { rerender } = render(<TxHistoryNotifier />);

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

    txState = {
      transactions: [
        {
          hash: '0xhash-finalize',
          name: TxName.STAKING_DELEGATE,
          status: 'finalized',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    rerender(<TxHistoryNotifier />);

    expect(mockCloseSnackbar).toHaveBeenCalledWith('0xhash-finalize');
    expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ variant: 'success' }),
    );
  });

  it('closes pending notification and emits error notification on failure', () => {
    txState = {
      transactions: [
        {
          hash: '0xhash-fail',
          name: TxName.STAKING_WITHDRAW,
          status: 'pending',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    const { rerender } = render(<TxHistoryNotifier />);

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

    txState = {
      transactions: [
        {
          hash: '0xhash-fail',
          name: TxName.STAKING_WITHDRAW,
          status: 'failed',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
          errorMessage: 'execution reverted',
        },
      ],
    };

    rerender(<TxHistoryNotifier />);

    expect(mockCloseSnackbar).toHaveBeenCalledWith('0xhash-fail');
    expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ variant: 'error' }),
    );
  });

  it('does not replay prior account transactions when active address changes', () => {
    txState = {
      transactions: [
        {
          hash: '0xhash-shared',
          name: TxName.STAKING_DEPOSIT,
          status: 'finalized',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    const { rerender } = render(<TxHistoryNotifier />);

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

    activeAddress = '0xdef0000000000000000000000000000000000000';
    txState = {
      transactions: [
        {
          hash: '0xhash-shared',
          name: TxName.STAKING_DEPOSIT,
          status: 'finalized',
          origin: activeAddress,
          network: 'base-sepolia',
          timestamp: Date.now(),
        },
      ],
    };

    rerender(<TxHistoryNotifier />);

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
    expect(mockCloseSnackbar).not.toHaveBeenCalled();
  });
});
