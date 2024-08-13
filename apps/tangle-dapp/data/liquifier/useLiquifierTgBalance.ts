import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';

import {
  LS_ERC20_TOKEN_MAP,
  LsErc20TokenId,
} from '../../constants/liquidStaking/liquidStakingEvm';
import liquifierTgTokenAbi from '../../constants/liquidStaking/liquifierTgTokenAbi';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContract from './useContract';

const useLiquifierTgBalance = (tokenId: LsErc20TokenId) => {
  const activeEvmAddress20 = useEvmAddress20();
  const { read } = useContract(liquifierTgTokenAbi);
  const [balance, setBalance] = useState<BN | null>(null);

  useEffect(() => {
    if (activeEvmAddress20 === null || read === null) {
      return;
    }

    const tokenDef = LS_ERC20_TOKEN_MAP[tokenId];

    read({
      address: tokenDef.liquifierTgTokenAddress,
      functionName: 'balanceOf',
      args: [activeEvmAddress20],
    }).then((result) => setBalance(new BN(result.toString())));
  }, [activeEvmAddress20, read, tokenId]);

  return balance;
};

export default useLiquifierTgBalance;
