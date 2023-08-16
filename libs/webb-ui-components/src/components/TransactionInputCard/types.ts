import { ComponentProps } from 'react';
import { PropsOf } from '../../types';
import { AdjustAmount } from '../BridgeInputs';
import { TextFieldInput } from '../TextField';
import TokenSelector from '../TokenSelector';
import { TitleWithInfo } from '../TitleWithInfo';

export type TransactionInputCardContextValue = {
  /**
   * The account type to display
   * @default 'wallet'
   */
  accountType?: 'wallet' | 'note';

  /**
   * The typed chain id to display the chain info on the selector.
   */
  typedChainId?: number;

  /**
   * The max amount of the transaction input card.
   */
  maxAmount?: number;

  /**
   * The token symbol of the transaction input card.
   */
  tokenSymbol?: string;

  /**
   * The amount of the transaction input card.
   */
  amount?: number;

  /**
   * The callback function to handle the amount change.
   */
  onAmountChange?: (amount: number) => void;

  /**
   * The boolean to indicate if the transaction input amount is fixed.
   */
  isFixedAmount?: boolean;

  /**
   * The callback function to handle the fixed amount change.
   */
  onIsFixedAmountChange?: (isFixedAmount: boolean) => void;
};

export interface TransactionInputCardRootProps
  extends PropsOf<'div'>,
    TransactionInputCardContextValue {}

export interface TransactionChainSelectorProps
  extends PropsOf<'button'>,
    Pick<TransactionInputCardContextValue, 'typedChainId'> {}

export interface TransactionMaxAmountButtonProps
  extends PropsOf<'button'>,
    Pick<
      TransactionInputCardContextValue,
      'tokenSymbol' | 'maxAmount' | 'accountType' | 'onAmountChange'
    > {}

export interface TransactionInputCardHeaderProps extends PropsOf<'div'> {}

export interface TransactionInputCardBodyProps
  extends PropsOf<'div'>,
    Pick<
      TransactionInputCardContextValue,
      'amount' | 'onAmountChange' | 'tokenSymbol' | 'isFixedAmount'
    > {
  /**
   * The props of the custom amount input.
   */
  customAmountProps?: ComponentProps<typeof TextFieldInput>;

  /**
   * The props of the fixed amount input.
   */
  fixedAmountProps?: ComponentProps<typeof AdjustAmount>;

  /**
   * The props of the token selector.
   */
  tokenSelectorProps?: ComponentProps<typeof TokenSelector>;
}

export interface TransactionInputCardFooterProps
  extends PropsOf<'div'>,
    Pick<
      TransactionInputCardContextValue,
      'isFixedAmount' | 'onIsFixedAmountChange'
    > {
  /**
   * Label with tooltip info props
   */
  labelWithTooltipProps?: Partial<ComponentProps<typeof TitleWithInfo>>;
}
