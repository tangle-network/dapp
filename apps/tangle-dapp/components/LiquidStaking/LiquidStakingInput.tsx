'use client';

import { BN } from '@polkadot/util';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '@webb-tools/icons';
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
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChainId,
  LiquidStakingToken,
  LS_CHAIN_TO_NETWORK_NAME,
} from '../../constants/liquidStaking';
import { ERROR_NOT_ENOUGH_BALANCE } from '../../containers/ManageProfileModalContainer/Independent/IndependentAllocationInput';
import useInputAmount from '../../hooks/useInputAmount';
import formatBn from '../../utils/formatBn';
import ChainLogo from './ChainLogo';
import HoverButtonStyle from './HoverButtonStyle';
import TokenChip from './TokenChip';

export type LiquidStakingInputProps = {
  id: string;
  chainId: LiquidStakingChainId;
  decimals: number;
  amount: BN | null;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  token: LiquidStakingToken;
  isTokenLiquidVariant?: boolean;
  minAmount?: BN;
  maxAmount?: BN;
  maxErrorMessage?: string;
  onAmountChange?: (newAmount: BN | null) => void;
  setChainId?: (newChain: LiquidStakingChainId) => void;
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

    const unit = `${isTokenLiquidVariant ? LIQUID_STAKING_TOKEN_PREFIX : ''}${token}`;

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
          <ChainSelector selectedChain={chainId} setChain={setChainId} />

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
  selectedChain: LiquidStakingChainId;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setChain?: (newChain: LiquidStakingChainId) => void;
};

const ChainSelector: FC<ChainSelectorProps> = ({ selectedChain, setChain }) => {
  const isReadOnly = setChain === undefined;

  const base = (
    <div
      className={twMerge(
        'flex gap-2 items-center justify-center',
        // Provide some padding for consistency with the
        // non-read-only variant.
        isReadOnly && 'px-3',
      )}
    >
      <ChainLogo size="sm" chainId={selectedChain} />

      <Typography variant="h5" fw="bold" className="dark:text-mono-40">
        {LS_CHAIN_TO_NETWORK_NAME[selectedChain]}
      </Typography>

      {!isReadOnly && <ChevronDown className="dark:fill-mono-120" size="lg" />}
    </div>
  );

  return setChain !== undefined ? (
    <Dropdown>
      <DropdownMenuTrigger>
        <HoverButtonStyle>{base}</HoverButtonStyle>
      </DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea className="max-h-[300px]">
          <ul>
            {Object.values(LiquidStakingChainId)
              .filter((chain) => chain !== selectedChain)
              .map((chain) => {
                return (
                  <li key={chain} className="w-full">
                    <DropdownMenuItem
                      leftIcon={<ChainLogo size="sm" chain={chain} />}
                      onSelect={() => setChain(chain)}
                      className="px-3 normal-case"
                    >
                      {LS_CHAIN_TO_NETWORK_NAME[chain]}
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
