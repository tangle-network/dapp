'use client';

import { BN } from '@polkadot/util';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { forwardRef, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsNetworkId, LsToken } from '../../../constants/liquidStaking/types';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../../containers/ManageProfileModalContainer/Independent/IndependentAllocationInput';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useInputAmount from '../../../hooks/useInputAmount';
import formatBn from '../../../utils/formatBn';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import ErrorMessage from '../../ErrorMessage';
import LsNetworkSwitcher from './LsNetworkSwitcher';
import LsTokenChip from './LsTokenChip';
import SelectedPoolIndicator from './SelectedPoolIndicator';

export type LsInputProps = {
  id: string;
  networkId: LsNetworkId;
  decimals: number;
  amount: BN | null;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  token: LsToken;
  isDerivativeVariant?: boolean;
  minAmount?: BN;
  maxAmount?: BN;
  maxErrorMessage?: string;
  className?: string;
  showPoolIndicator?: boolean;
  onAmountChange?: (newAmount: BN | null) => void;
  setProtocolId?: (newProtocolId: LsProtocolId) => void;
  setNetworkId?: (newNetworkId: LsNetworkId) => void;
  onTokenClick?: () => void;
};

const LsInput = forwardRef<HTMLInputElement, LsInputProps>(
  (
    {
      id,
      amount,
      decimals,
      isReadOnly = false,
      placeholder = '0',
      isDerivativeVariant = false,
      rightElement,
      networkId,
      token,
      minAmount,
      maxAmount,
      maxErrorMessage = ERROR_NOT_ENOUGH_BALANCE,
      onAmountChange,
      setNetworkId,
      className,
      showPoolIndicator = true,
      onTokenClick,
    },
    ref,
  ) => {
    const { lsProtocolId } = useLsStore();

    const selectedProtocol = getLsProtocolDef(lsProtocolId);

    const minErrorMessage = ((): string | undefined => {
      if (minAmount === undefined) {
        return undefined;
      }

      const unit = `${isDerivativeVariant ? LS_DERIVATIVE_TOKEN_PREFIX : ''}${token}`;

      const formattedMinAmount = formatBn(minAmount, decimals, {
        fractionMaxLength: undefined,
        includeCommas: true,
      });

      return `Amount must be at least ${formattedMinAmount} ${unit}`;
    })();

    const { displayAmount, handleChange, errorMessage, setDisplayAmount } =
      useInputAmount({
        amount,
        setAmount: onAmountChange,
        decimals,
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
      <div className="flex flex-col items-stretch justify-start gap-2">
        <div
          className={twMerge(
            'flex flex-col gap-3 bg-mono-20 dark:bg-mono-180 p-4 rounded-lg border border-transparent',
            isError && 'border-red-70 dark:border-red-50',
          )}
        >
          <div className="flex justify-between">
            <LsNetworkSwitcher
              activeLsNetworkId={networkId}
              setNetworkId={setNetworkId}
            />

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
                token={selectedProtocol.token}
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
