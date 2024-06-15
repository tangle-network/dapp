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
import { FC, ReactNode, useCallback, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChain,
  LiquidStakingToken,
  LS_CHAIN_TO_NETWORK_NAME,
  LS_TOKEN_TO_CHAIN,
} from '../../../constants/liquidStaking';
import useInputAmount from '../../../hooks/useInputAmount';
import formatBn from '../../../utils/formatBn';
import ChainLogo from '../ChainLogo';
import HoverButtonStyle from '../HoverButtonStyle';

export type LiquidStakingInputProps = {
  id: string;
  chain: LiquidStakingChain;
  setChain?: (newChain: LiquidStakingChain) => void;
  amount: BN | null;
  setAmount?: (newAmount: BN | null) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  rightElement?: ReactNode;
  token: LiquidStakingToken;
  isTokenLiquidVariant?: boolean;
  minAmount?: BN;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  setAmount,
  isReadOnly = false,
  placeholder = '0',
  isTokenLiquidVariant = false,
  rightElement,
  chain,
  setChain,
  token,
  minAmount,
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

  const { displayAmount, handleChange, refreshDisplayAmount, errorMessage } =
    useInputAmount({
      amount,
      setAmount,
      // TODO: Decimals must be based on the active token's chain decimals, not always the Tangle token decimals.
      decimals: TANGLE_TOKEN_DECIMALS,
      min: minAmount,
      minErrorMessage,
    });

  // TODO: This is preventing the user from inputting values like `0.001`. May need to use Decimal.js to handle small amounts, then convert into BN in the implementation of the `useInputAmount` hook?
  // Refresh the display amount when the amount changes.
  useEffect(() => {
    refreshDisplayAmount(amount);
  }, [amount, refreshDisplayAmount]);

  const handleChainChange = useCallback(
    (newChain: LiquidStakingChain) => {
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

          <TokenChip token={token} isLiquidVariant={isTokenLiquidVariant} />
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
};

/** @internal */
const TokenChip: FC<TokenChipProps> = ({ token, isLiquidVariant }) => {
  const chain = LS_TOKEN_TO_CHAIN[token];

  return (
    <div className="flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-160 px-4 py-2 rounded-lg">
      <ChainLogo size="sm" chain={chain} isRounded />

      <Typography variant="h5" fw="bold">
        {isLiquidVariant && LIQUID_STAKING_TOKEN_PREFIX}
        {token}
      </Typography>
    </div>
  );
};

type ChainSelectorProps = {
  selectedChain: LiquidStakingChain;

  /**
   * If this function is not provided, the selector will be
   * considered read-only.
   */
  setChain?: (newChain: LiquidStakingChain) => void;
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
      <ChainLogo size="sm" chain={selectedChain} />

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
            {Object.values(LiquidStakingChain)
              .filter((chain) => chain !== selectedChain)
              .map((chain) => {
                return (
                  <li key={chain} className="w-full">
                    <MenuItem
                      startIcon={<ChainLogo size="sm" chain={chain} />}
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
