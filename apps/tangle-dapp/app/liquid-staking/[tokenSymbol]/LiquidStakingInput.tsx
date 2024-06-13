'use client';

import { BN } from '@polkadot/util';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { ChevronDown, TokenIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBody,
  MenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { FC, ReactNode, useEffect } from 'react';

import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingChain,
  LiquidStakingChainToTokenMap,
  LiquidStakingToken,
} from '../../../constants/liquidStaking';
import useInputAmount from '../../../hooks/useInputAmount';
import HoverButtonStyle from '../HoverButtonStyle';
import TokenLogo from '../TokenLogo';

export type LiquidStakingInputProps = {
  id: string;
  // TODO: Make use of this.
  selectedToken: LiquidStakingToken;
  amount: BN | null;
  setAmount?: (newAmount: BN | null) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  isLiquidVariant?: boolean;
  rightElement?: ReactNode;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  setAmount,
  isReadOnly = false,
  placeholder = '0',
  isLiquidVariant = false,
  rightElement,
}) => {
  const { displayAmount, handleChange, refreshDisplayAmount } = useInputAmount({
    amount,
    setAmount,
    // TODO: Decimals must be based on the active token's chain decimals, not always the Tangle token decimals.
    decimals: TANGLE_TOKEN_DECIMALS,
  });

  // TODO: This is preventing the user from inputting values like `0.001`. May need to use Decimal.js to handle small amounts, then convert into BN in the implementation of the `useInputAmount` hook?
  // Refresh the display amount when the amount changes.
  useEffect(() => {
    refreshDisplayAmount(amount);
  }, [amount, refreshDisplayAmount]);

  return (
    <div className="flex flex-col gap-3 dark:bg-mono-180 p-3 rounded-lg">
      <div className="flex justify-between">
        <ChainSelector
          // TODO: Using dummy props.
          chain={LiquidStakingChain.Polkadot}
          setChain={() => void 0}
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
          chain={LiquidStakingChain.Polkadot}
          isLiquidVariant={isLiquidVariant}
        />
      </div>
    </div>
  );
};

type TokenChipProps = {
  chain: LiquidStakingChain;
  isLiquidVariant: boolean;
};

/** @internal */
const TokenChip: FC<TokenChipProps> = ({ chain, isLiquidVariant }) => {
  const token = LiquidStakingChainToTokenMap[chain];

  return (
    <div className="flex gap-2 justify-center items-center dark:bg-mono-160 px-4 py-2 rounded-lg">
      <TokenLogo size="sm" chain={chain} />

      <Typography variant="h5" fw="bold">
        {isLiquidVariant && LIQUID_STAKING_TOKEN_PREFIX}
        {token}
      </Typography>
    </div>
  );
};

type ChainSelectorProps = {
  chain: LiquidStakingChain;
  setChain: (newChain: LiquidStakingChain) => void;
};

const ChainSelector: FC<ChainSelectorProps> = ({ chain, setChain }) => {
  return (
    <Dropdown>
      <DropdownMenuTrigger>
        <HoverButtonStyle>
          <div className="flex gap-2 items-center justify-center">
            <TokenLogo size="sm" chain={chain} />

            <Typography variant="h5" fw="bold" className="dark:text-mono-40">
              Polkadot Mainnet
            </Typography>

            <ChevronDown className="dark:fill-mono-120" size="lg" />
          </div>
        </HoverButtonStyle>
      </DropdownMenuTrigger>

      <DropdownBody>
        <ScrollArea className="max-h-[300px] w-[130px]">
          <ul>
            {['a', 'b', 'c'].map((tokenId) => {
              return (
                <li key={tokenId}>
                  <MenuItem
                    startIcon={<TokenIcon size="lg" name={tokenId} />}
                    onSelect={() => void 0}
                    className="px-3 normal-case"
                  >
                    {tokenId}
                  </MenuItem>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  );
};

export default LiquidStakingInput;
