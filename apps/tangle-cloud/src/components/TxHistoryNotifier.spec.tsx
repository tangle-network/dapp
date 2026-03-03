import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TxHistoryNotifier from './TxHistoryNotifier';

type TxState = {
  transactions: Array<{
    hash: string;
    name: string;
    status: 'pending' | 'inblock' | 'finalized' | 'failed';
    origin: string;
    network: string;
    errorMessage?: string;
  }>;
};

const mockEnqueueSnackbar = vi.fn();
const mockCloseSnackbar = vi.fn();
const mockUseEvmAddress = vi.fn();

let txState: TxState = { transactions: [] };

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
    mockUseEvmAddress.mockReturnValue(
      '0xabc0000000000000000000000000000000000000',
    );
    txState = {
      transactions: [],
    };
  });

  it('notifies when transaction status transitions after initial hydration', () => {
    txState = {
      transactions: [
        {
          hash: '0xhash1',
          name: 'approve service',
          status: 'pending',
          origin: '0xabc0000000000000000000000000000000000000',
          network: 'base-sepolia',
        },
      ],
    };

    const { rerender } = render(<TxHistoryNotifier />);

    // Initial hydration should not emit notifications.
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

    txState = {
      transactions: [
        {
          hash: '0xhash1',
          name: 'approve service',
          status: 'finalized',
          origin: '0xabc0000000000000000000000000000000000000',
          network: 'base-sepolia',
        },
      ],
    };

    rerender(<TxHistoryNotifier />);

    expect(mockCloseSnackbar).toHaveBeenCalledWith('0xhash1');
    expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
  });

  it('emits failure notification for failed transactions', () => {
    txState = {
      transactions: [
        {
          hash: '0xhash2',
          name: 'join service',
          status: 'pending',
          origin: '0xabc0000000000000000000000000000000000000',
          network: 'base-sepolia',
        },
      ],
    };

    const { rerender } = render(<TxHistoryNotifier />);
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();

    txState = {
      transactions: [
        {
          hash: '0xhash2',
          name: 'join service',
          status: 'failed',
          origin: '0xabc0000000000000000000000000000000000000',
          network: 'base-sepolia',
          errorMessage: 'boom',
        },
      ],
    };

    rerender(<TxHistoryNotifier />);

    expect(mockCloseSnackbar).toHaveBeenCalledWith('0xhash2');
    expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
  });
});
