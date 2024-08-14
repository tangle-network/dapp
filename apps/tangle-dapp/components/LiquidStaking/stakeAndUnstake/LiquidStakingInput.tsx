'use client';

import { BN } from '@polkadot/util';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  getLsProtocolDef,
  LsProtocolId,
  LST_PREFIX,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../../containers/ManageProfileModalContainer/Independent/IndependentAllocationInput';
import useInputAmount from '../../../hooks/useInputAmount';
import formatBn from '../../../utils/formatBn';
import ChainLogo from './ChainLogo';
import DropdownChevronIcon from './DropdownChevronIcon';
import TokenChip from './TokenChip';

export type LiquidStakingInputProps = {
  id: string;
  chainId: LsProtocolId;
  decimals: number;
  amount: BN | null;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  token: LsToken;
  isTokenLiquidVariant?: boolean;
  minAmount?: BN;
  maxAmount?: BN;
  maxErrorMessage?: string;
  onAmountChange?: (newAmount: BN | null) => void;
  setChainId?: (newChain: LsProtocolId) => void;
  onTokenClick?: () => void;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  decimals,
  isReadOnly = false,
  placeholder = '0',
  isTokenLiquidVariant = false,
  rightElement,
  chainId,
  token,
  minAmount,
  maxAmount,
  maxErrorMessage = ERROR_NOT_ENOUGH_BALANCE,
  onAmountChange,
  setChainId,
  onTokenClick,
}) => {
  const minErrorMessage = ((): string | undefined => {
    if (minAmount === undefined) {
      return undefined;
    }

    const unit = `${isTokenLiquidVariant ? LST_PREFIX : ''}${token}`;

    const formattedMinAmount = formatBn(minAmount, decimals, {
      fractionMaxLength: undefined,
      includeCommas: true,
    });

    return `Amount must be at least ${formattedMinAmount} ${unit}`;
  })();

  const {
    displayAmount,
    handleChange,
    errorMessage,
    updateDisplayAmountManual,
  } = useInputAmount({
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
      updateDisplayAmountManual(amount);
    }
  }, [amount, updateDisplayAmountManual]);

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
          <ChainSelector selectedChainId={chainId} setChainId={setChainId} />

          {rightElement}
        </div>

        <hr className="dark:border-mono-160" />

        <div className="flex gap-1">
          <input
            id={id}
            className="w-full bg-transparent border-none text-xl font-bold outline-none focus:ring-0"
            type="text"
            placeholder={placeholder}
            value={displayAmount}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={isReadOnly}
          />

          <TokenChip
            onClick={onTokenClick}
            token={token}
            isLiquidVariant={isTokenLiquidVariant}
          />
        </div>
      </div>

      {errorMessage !== null && (
        <Typography variant="body2" className="text-red-70 dark:text-red-50">
          * {errorMessage}
        </Typography>
      )}
    </>
  );
};

type ChainSelectorProps = {
  selectedChainId: LsProtocolId;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setChainId?: (newChain: LsProtocolId) => void;
};

/** @internal */
const ChainSelector: FC<ChainSelectorProps> = ({
  selectedChainId,
  setChainId,
}) => {
  const isReadOnly = setChainId === undefined;

  const base = (
    <div className="group flex gap-1 items-center justify-center">
      <div className="flex gap-2 items-center justify-center">
        <ChainLogo size="sm" chainId={selectedChainId} />

        <Typography variant="h5" fw="bold" className="dark:text-mono-40">
          {getLsProtocolDef(selectedChainId).networkName}
        </Typography>
      </div>

      {!isReadOnly && <DropdownChevronIcon isLarge />}
    </div>
  );

  return setChainId !== undefined ? (
    <Dropdown>
      <DropdownMenuTrigger>{base}</DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea className="max-h-[300px]">
          <ul>
            {Object.values(LsProtocolId)
              .filter(
                (chainId): chainId is LsProtocolId =>
                  chainId !== selectedChainId && typeof chainId !== 'string',
              )
              .map((chainId) => {
                return (
                  <li key={chainId} className="w-full">
                    <DropdownMenuItem
                      leftIcon={<ChainLogo size="sm" chainId={chainId} />}
                      onSelect={() => setChainId(chainId)}
                      className="px-3 normal-case"
                    >
                      {getLsProtocolDef(chainId).networkName}
                    </DropdownMenuItem>
                  </li>
                );
              })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  ) : (
    base
  );
};

export default LiquidStakingInput;
