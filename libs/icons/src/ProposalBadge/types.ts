import { ComponentProps } from 'react';

export type ProposalVariant =
  | 'AnchorCreate'
  | 'AnchorUpdate'
  | 'Evm'
  | 'FeeRecipientUpdate'
  | 'MaxDepositLimitUpdate'
  | 'MinWithdrawalLimitUpdate'
  | 'Refresh'
  | 'RescueTokens'
  | 'ResourceIdUpdate'
  | 'SetTreasuryHandler'
  | 'SetVerifier'
  | 'TokenAdd'
  | 'TokenRemove'
  | 'WrappingFeeUpdate';

export interface ProposalBadgeProps extends ComponentProps<'svg'> {
  /**
   * The type of the proposal
   */
  variant: ProposalVariant;
}
