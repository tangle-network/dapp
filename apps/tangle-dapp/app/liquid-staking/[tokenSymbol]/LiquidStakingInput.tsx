'use client';

import { BN } from '@polkadot/util';
import { WalletLineIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect } from 'react';

import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingToken,
} from '../../../constants/liquidStaking';
import useInputAmount from '../../../hooks/useInputAmount';

export type LiquidStakingInputProps = {
  id: string;
  // TODO: Make use of this.
  selectedToken: LiquidStakingToken;
  amount: BN | null;
  setAmount?: (newAmount: BN | null) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  isLST?: boolean;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  setAmount,
  isReadOnly = false,
  placeholder = '0',
  isLST = false,
}) => {
  const { displayAmount, handleChange, refreshDisplayAmount } = useInputAmount({
    amount,
    setAmount,
  });

  // TODO: This is preventing the user from inputting values like `0.001`. May need to use Decimal.js to handle small amounts, then convert into BN in the implementation of the `useInputAmount` hook?
  // Refresh the display amount when the amount changes.
  useEffect(() => {
    refreshDisplayAmount(amount);
  }, [amount, refreshDisplayAmount]);

  return (
    <div className="flex flex-col gap-3 dark:bg-mono-180 p-3 rounded-lg">
      <div className="flex justify-between">
        <Typography variant="h5" fw="bold" className="dark:text-mono-40">
          Polkadot Mainnet
        </Typography>

        <Typography
          variant="body1"
          fw="bold"
          className="flex gap-1 items-center dark:text-mono-80"
        >
          <WalletLineIcon /> 0.00
        </Typography>
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

        <TokenCard token={LiquidStakingToken.DOT} isLST={isLST} />
      </div>
    </div>
  );
};

type TokenCardProps = {
  token: LiquidStakingToken;
  isLST: boolean;
};

/** @internal */
const TokenCard: FC<TokenCardProps> = ({ token, isLST }) => {
  return (
    <div className="dark:bg-mono-160 px-4 py-2 rounded-lg">
      <Typography variant="h5" fw="bold">
        {isLST && LIQUID_STAKING_TOKEN_PREFIX}
        {token}
      </Typography>
    </div>
  );
};

export default LiquidStakingInput;
