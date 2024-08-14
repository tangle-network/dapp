import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';

import { LS_ERC20_TOKEN_MAP } from '../../constants/liquidStaking/liquidStakingErc20';
import LIQUIFIER_TG_TOKEN_ABI from '../../constants/liquidStaking/liquifierTgTokenAbi';
import { LsErc20TokenId } from '../../constants/liquidStaking/types';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContract from './useContract';

const useLiquifierTgBalance = (tokenId: LsErc20TokenId) => {
  const activeEvmAddress20 = useEvmAddress20();
  const { read } = useContract(LIQUIFIER_TG_TOKEN_ABI);
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
