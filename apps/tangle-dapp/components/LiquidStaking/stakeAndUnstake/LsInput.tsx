'use client';

import { BN } from '@polkadot/util';
import { Typography } from '@webb-tools/webb-ui-components';
import { forwardRef, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import {
  LsNetworkId,
  LsProtocolId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../../containers/ManageProfileModalContainer/Independent/IndependentAllocationInput';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useInputAmount from '../../../hooks/useInputAmount';
import formatBn from '../../../utils/formatBn';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import NetworkSelector from './NetworkSelector';
import SelectedPoolIndicator from './SelectedPoolIndicator';
import TokenChip from './TokenChip';

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
      <>
        <div
          className={twMerge(
            'flex flex-col gap-3 bg-mono-20 dark:bg-mono-180 p-3 rounded-lg border border-mono-40 dark:border-mono-160',
            isError && 'border-red-70 dark:border-red-50',
          )}
        >
          <div className="flex justify-between">
            <NetworkSelector
              selectedNetworkId={networkId}
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
                'w-full bg-transparent border-none text-xl font-bold outline-none focus:ring-0',
                className,
              )}
              type="text"
              placeholder={placeholder}
              value={displayAmount}
              onChange={(e) => handleChange(e.target.value)}
              readOnly={isReadOnly}
            />

            {showPoolIndicator ? (
              <SelectedPoolIndicator />
            ) : (
              <TokenChip
                isDerivativeVariant={isDerivativeVariant}
                token={selectedProtocol.token}
              />
            )}
          </div>
        </div>

        {errorMessage !== null && (
          <Typography variant="body2" className="text-red-70 dark:text-red-50">
            * {errorMessage}
          </Typography>
        )}
      </>
    );
  },
);

export default LsInput;
