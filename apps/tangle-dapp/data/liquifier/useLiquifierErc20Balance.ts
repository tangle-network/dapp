import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';

import { LS_ERC20_TOKEN_MAP } from '../../constants/liquidStaking/constants';
import { LsErc20TokenId } from '../../constants/liquidStaking/types';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContractRead from './useContractRead';

const useLiquifierErc20Balance = (tokenId: LsErc20TokenId): BN | null => {
  const activeEvmAddress20 = useEvmAddress20();
  const [balance, setBalance] = useState<BN | null>(null);
  const read = useContractRead(erc20Abi);

  // TODO: This only loads the balance once. Make it so it updates every few seconds that way the it responds to any balance changes that may occur, not just when loading the site initially. Like a subscription.
  useEffect(() => {
    if (activeEvmAddress20 === null || read === null) {
      return;
    }

    const tokenDef = LS_ERC20_TOKEN_MAP[tokenId];

    read({
      address: tokenDef.address,
      functionName: 'balanceOf',
      args: [activeEvmAddress20],
    }).then((result) => {
      if (result instanceof Error) {
        return;
      }

      setBalance((prevBalance) => {
        const newBalance = new BN(result.toString());

        // Do not update the balance state with a new BN instance if
        // it is the same as the current balance.
        if (prevBalance?.toString() === newBalance.toString()) {
          return prevBalance;
        }

        return newBalance;
      });
    });
  }, [activeEvmAddress20, read, tokenId]);

  return balance;
};

export default useLiquifierErc20Balance;
