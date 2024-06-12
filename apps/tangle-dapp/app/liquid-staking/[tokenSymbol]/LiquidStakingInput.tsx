import { BN } from '@polkadot/util';
import { WalletLineIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LiquidStakingToken } from '../../../constants/liquidStaking';
import useInputAmount from '../../../hooks/useInputAmount';

export type LiquidStakingInputProps = {
  id: string;
  // TODO: Make use of this.
  selectedToken: LiquidStakingToken;
  amount: BN | null;
  setAmount?: (newAmount: BN | null) => void;
  isReadOnly?: boolean;
  placeholder?: string;
};

const LiquidStakingInput: FC<LiquidStakingInputProps> = ({
  id,
  amount,
  setAmount,
  isReadOnly = false,
  placeholder = '0',
}) => {
  const { displayAmount, handleChange } = useInputAmount({ amount, setAmount });

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
