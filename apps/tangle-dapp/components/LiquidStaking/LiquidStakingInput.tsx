'use client';

import { BN } from '@polkadot/util';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { ChevronDown } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  MenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import assert from 'assert';
import { FC, ReactNode, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LIQUID_STAKING_CHAINS,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChainId,
  LiquidStakingToken,
  LS_CHAIN_TO_NETWORK_NAME,
} from '../../constants/liquidStaking';
import useInputAmount from '../../hooks/useInputAmount';
import formatBn from '../../utils/formatBn';
import ChainLogo from './ChainLogo';
import HoverButtonStyle from './HoverButtonStyle';

export type LiquidStakingInputProps = {
  id: string;
  chain: LiquidStakingChainId;
  setChain?: (newChain: LiquidStakingChainId) => void;
  amount: BN | null;
  setAmount?: (newAmount: BN | null) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  token: LiquidStakingToken;
  onTokenClick?: () => void;
  isTokenLiquidVariant?: boolean;
  minAmount?: BN;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  isReadOnly = false,
  placeholder = '0',
  isTokenLiquidVariant = false,
  rightElement,
  chain,
  token,
  minAmount,
  setAmount,
  setChain,
  onTokenClick,
}) => {
  const minErrorMessage = ((): string | undefined => {
    if (minAmount === undefined) {
      return undefined;
    }

    const unit = `${isTokenLiquidVariant ? LIQUID_STAKING_TOKEN_PREFIX : ''}${token}`;

    // TODO: Must consider the chain's token decimals, not always the Tangle token decimals.
    const formattedMinAmount = formatBn(minAmount, TANGLE_TOKEN_DECIMALS);

    return `Amount must be at least ${formattedMinAmount} ${unit}`;
  })();

  const { displayAmount, handleChange, errorMessage } = useInputAmount({
    amount,
    setAmount,
    // TODO: Decimals must be based on the active token's chain decimals, not always the Tangle token decimals.
    decimals: TANGLE_TOKEN_DECIMALS,
    min: minAmount,
    minErrorMessage,
  });

  const handleChainChange = useCallback(
    (newChain: LiquidStakingChainId) => {
      if (setChain !== undefined) {
        setChain(newChain);
      }
    },
    [setChain],
  );

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
          <ChainSelector
            selectedChain={chain}
            setChain={isReadOnly ? undefined : handleChainChange}
          />

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

      {errorMessage && (
        <Typography variant="body2" className="text-red-70 dark:text-red-50">
          * {errorMessage}
        </Typography>
      )}
    </>
  );
};

type TokenChipProps = {
  token: LiquidStakingToken;
  isLiquidVariant: boolean;
  onClick?: () => void;
};

/** @internal */
const TokenChip: FC<TokenChipProps> = ({ token, isLiquidVariant, onClick }) => {
  const chain = LIQUID_STAKING_CHAINS.find((chain) => chain.token === token);

  assert(chain !== undefined, 'All tokens should have a corresponding chain');

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-160 px-4 py-2 rounded-lg',
        onClick && 'cursor-pointer hover:dark:bg-mono-140',
      )}
    >
      <ChainLogo size="sm" chainId={chain.id} isRounded />

      <Typography variant="h5" fw="bold">
        {isLiquidVariant && LIQUID_STAKING_TOKEN_PREFIX}
        {token}
      </Typography>
    </div>
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
                    <MenuItem
                      startIcon={<ChainLogo size="sm" chainId={chain} />}
                      onSelect={() => setChain(chain)}
                      className="px-3 normal-case"
                    >
                      {LS_CHAIN_TO_NETWORK_NAME[chain]}
                    </MenuItem>
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
