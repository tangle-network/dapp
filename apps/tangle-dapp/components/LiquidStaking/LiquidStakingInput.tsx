import { WalletLineIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LiquidStakingToken } from '../../constants/liquidStaking';

export type LiquidStakingInputProps = {
  id: string;
  selectedToken: LiquidStakingToken;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({ id }) => {
  return (
    <div className="flex flex-col gap-3 dark:bg-mono-180 p-3 rounded-lg w-full">
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
          className="w-full bg-transparent border-none text-xl font-bold focus:outline-none"
          placeholder="0"
        />

        <TokenCard token={LiquidStakingToken.DOT} />
      </div>
    </div>
  );
};

type TokenCardProps = {
  token: LiquidStakingToken;
};

/** @internal */
const TokenCard: FC<TokenCardProps> = ({ token }) => {
  return (
    <div className="dark:bg-mono-160 px-4 py-2 rounded-lg">
      <Typography variant="h5" fw="bold">
        {token}
      </Typography>
    </div>
  );
};

export default LiquidStakingInput;
