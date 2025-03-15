import { BN } from '@polkadot/util';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import {
  EMPTY_VALUE_PLACEHOLDER,
  formatBn,
} from '@tangle-network/ui-components';
import { forwardRef, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import useInputAmount from '../../../hooks/useInputAmount';
import ErrorMessage from '../../ErrorMessage';
import LsActiveNetwork from './LsActiveNetwork';
import LsTokenChip from './LsTokenChip';
import SelectedPoolIndicator from './SelectedPoolIndicator';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../../constants';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

type Props = {
  id: string;
  amount: BN | null;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  isDerivativeVariant?: boolean;
  minAmount?: BN;
  maxAmount?: BN;
  maxErrorMessage?: string;
  className?: string;
  showPoolIndicator?: boolean;
  onAmountChange?: (newAmount: BN | null) => void;
  setProtocolId?: (newProtocolId: LsProtocolId) => void;
  onTokenClick?: () => void;
};

const LsInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      amount,
      isReadOnly = false,
      placeholder = '0',
      isDerivativeVariant = false,
      rightElement,
      minAmount,
      maxAmount,
      maxErrorMessage = ERROR_NOT_ENOUGH_BALANCE,
      onAmountChange,
      className,
      showPoolIndicator = true,
      onTokenClick,
    },
    ref,
  ) => {
    const networkTokenSymbol =
      useNetworkStore((store) => store.network2?.tokenSymbol) ??
      EMPTY_VALUE_PLACEHOLDER;

    const minErrorMessage = ((): string | undefined => {
      if (minAmount === undefined) {
        return undefined;
      }

      const formattedMinAmount = formatBn(minAmount, TANGLE_TOKEN_DECIMALS, {
        fractionMaxLength: undefined,
        includeCommas: true,
      });

      return `Amount must be at least ${formattedMinAmount} ${networkTokenSymbol}`;
    })();

    const { displayAmount, handleChange, errorMessage, setDisplayAmount } =
      useInputAmount({
        amount,
        setAmount: onAmountChange,
        decimals: TANGLE_TOKEN_DECIMALS,
        min: minAmount,
        minErrorMessage,
        max: maxAmount,
        maxErrorMessage,
      });

    // Update the display amount when the amount prop changes.
    // Only do this for controlled (read-only) inputs.
    useEffect(() => {
      if (amount !== null) {
        setDisplayAmount(amount);
      }
    }, [amount, setDisplayAmount]);

    const isError = errorMessage !== null;

    return (
      <div className="flex flex-col items-stretch justify-start">
        <div
          className={twMerge(
            'flex flex-col gap-3 bg-mono-20 dark:bg-mono-180 p-4 rounded-lg border border-transparent',
            isError && 'border-red-70 dark:border-red-50',
          )}
        >
          <div className="flex justify-between">
            <LsActiveNetwork />

            {rightElement}
          </div>

          <hr className="dark:border-mono-160" />

          <div className="flex gap-1">
            <input
              ref={ref}
              id={id}
              className={twMerge(
                'flex-grow bg-transparent border-none text-xl font-bold outline-none focus:ring-0',
                className,
              )}
              type="text"
              placeholder={placeholder}
              value={displayAmount}
              onChange={(e) => handleChange(e.target.value)}
              readOnly={isReadOnly}
            />

            {showPoolIndicator ? (
              <SelectedPoolIndicator onClick={onTokenClick} />
            ) : (
              <LsTokenChip
                isDerivativeVariant={isDerivativeVariant}
                onClick={onTokenClick}
              />
            )}
          </div>
        </div>

        {errorMessage !== null && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </div>
    );
  },
);

LsInput.displayName = 'LsInput';

export default LsInput;
