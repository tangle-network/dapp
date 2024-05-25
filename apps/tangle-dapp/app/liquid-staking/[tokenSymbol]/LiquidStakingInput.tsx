import { Input, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LiquidStakingToken } from '../../../constants/liquidStaking';

export type LiquidStakingInputProps = {
  id: string;
  selectedToken: LiquidStakingToken;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({ id }) => {
  return (
    <div className="flex flex-col dark:bg-mono-180 p-3 rounded-lg">
      <div></div>

      <hr />

      <div className="flex gap-1">
        <Input id={id} className="w-full" placeholder="0" />

        <TokenCard token={LiquidStakingToken.Polkadot} />
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
