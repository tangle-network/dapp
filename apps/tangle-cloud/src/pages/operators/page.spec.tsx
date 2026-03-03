import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Page from './page';
import { createStakeDelegateUrl } from './createStakeDelegateUrl';

const mockUseOperators = vi.fn();
const mockUseAccount = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@tangle-network/tangle-shared-ui/data/graphql/useOperators', () => ({
  useOperators: () => mockUseOperators(),
}));

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock(
  '@tangle-network/tangle-shared-ui/components/tables/OperatorsTable',
  () => ({
    OperatorsTable: ({
      onStakeClicked,
    }: {
      onStakeClicked: (operatorAddress?: `0x${string}`) => void;
    }) => (
      <div>
        <button onClick={() => onStakeClicked()}>stake-none</button>
        <button
          onClick={() =>
            onStakeClicked('0x1234567890123456789012345678901234567890')
          }
        >
          stake-operator
        </button>
      </div>
    ),
  }),
);

describe('Operators Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOperators.mockReturnValue({ data: [], isLoading: false });
  });

  it('navigates to manage registrations when connected', () => {
    mockUseAccount.mockReturnValue({ isConnected: true });

    render(<Page />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Manage Registrations' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/operators/manage');
  });

  it('creates staking delegate URLs with optional operator query', () => {
    const baseUrl = createStakeDelegateUrl();
    const operatorUrl = createStakeDelegateUrl(
      '0x1234567890123456789012345678901234567890',
    );

    expect(baseUrl).toContain('/staking/delegate');
    expect(baseUrl).not.toContain('operator=');
    expect(operatorUrl).toContain('/staking/delegate');
    expect(operatorUrl).toContain(
      'operator=0x1234567890123456789012345678901234567890',
    );
  });
});
