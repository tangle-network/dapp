import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';

import {
  LS_ERC20_TOKEN_MAP,
  LsErc20TokenId,
} from '../../constants/liquidStaking/liquidStakingEvm';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContract from './useContract';

const useLiquifierErc20Balance = (tokenId: LsErc20TokenId): BN | null => {
  const activeEvmAddress20 = useEvmAddress20();
  const [balance, setBalance] = useState<BN | null>(null);
  const { read } = useContract(erc20Abi);

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
    }).then((result) => setBalance(new BN(result.toString())));
  }, [activeEvmAddress20, read, tokenId]);

  return balance;
};

export default useLiquifierErc20Balance;
