import type {
  ComponentProps,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  ReactElement,
  ReactNode,
} from 'react';
import type { PropsOf } from '../../types';
import type { AdjustAmount } from '../BridgeInputs';
import type { TextFieldInput } from '../TextField';
import type TokenSelector from '../TokenSelector';
import type { TitleWithInfo } from '../TitleWithInfo';

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
  maxAmount?: number | null;

  /**
   * The token symbol of the transaction input card.
   */
  tokenSymbol?: ReactNode;

  /**
   * The amount of the transaction input card.
   */
  amount?: string;

  /**
   * The callback function to handle the amount change.
   */
  onAmountChange?: (amount: string) => void;

  /**
   * The boolean to indicate if the transaction input amount is fixed.
   */
  isFixedAmount?: boolean;

  /**
   * The callback function to handle the fixed amount change.
   */
  onIsFixedAmountChange?: (isFixedAmount: boolean) => void;

  /**
   * The error message of the transaction input card.
   */
  errorMessage?: string | null;
};

export interface TransactionInputCardRootProps
  extends PropsOf<'div'>,
    TransactionInputCardContextValue {}

export type TransactionChainSelectorProps<TAs extends ElementType> = {
  as?: TAs;
} & Omit<
  ComponentPropsWithoutRef<ElementType extends TAs ? 'button' : TAs>,
  'as'
> &
  Pick<TransactionInputCardContextValue, 'typedChainId'> & {
    /**
     * @default 'Select Chain'
     */
    placeholder?: string;

    renderBody?: () => ReactNode;
  };

export interface TransactionButtonProps extends PropsOf<'button'> {
  /**
   * The icon of the transaction button.
   */
  Icon?: ReactElement | null;
}

export interface TransactionMaxAmountButtonProps
  extends PropsOf<'button'>,
    Pick<
      TransactionInputCardContextValue,
      'tokenSymbol' | 'maxAmount' | 'accountType' | 'onAmountChange'
    > {
  /**
   * The tooltip body for the max amount button.
   * @default "Shielded Balance" | "Wallet Balance" (based on the account type)
   */
  tooltipBody?: ReactNode;

  /**
   * The Icon for the max amount button.
   * #@default <ShieldKeyhole /> | <Wallet /> (based on the account type)
   */
  Icon?:
    | ReactElement
    | {
        enabled: ReactElement;
        disabled: ReactElement;
      };
}

export interface TransactionInputCardHeaderProps extends PropsOf<'div'> {}

export interface TransactionInputCardBodyProps
  extends PropsOf<'div'>,
    Pick<
      TransactionInputCardContextValue,
      'amount' | 'onAmountChange' | 'tokenSymbol' | 'isFixedAmount'
    > {
  hiddenAmountInput?: boolean;

  /**
   * The props of the custom amount input.
   */
  customAmountProps?: ComponentPropsWithRef<typeof TextFieldInput>;

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
