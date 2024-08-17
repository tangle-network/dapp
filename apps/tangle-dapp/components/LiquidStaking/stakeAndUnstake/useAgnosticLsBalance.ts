import { BN, BN_ZERO } from '@polkadot/util';
import assert from 'assert';
import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { LS_ERC20_TOKEN_MAP } from '../../../constants/liquidStaking/liquidStakingErc20';
import LIQUIFIER_TG_TOKEN_ABI from '../../../constants/liquidStaking/liquifierTgTokenAbi';
import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import useContract from '../../../data/liquifier/useContract';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';
import isLsErc20TokenId from '../../../utils/liquidStaking/isLsErc20TokenId';
import isLsParachainToken from '../../../utils/liquidStaking/isLsParachainToken';

const useAgnosticLsBalance = (isNative: boolean, protocolId: LsProtocolId) => {
  const substrateAddress = useSubstrateAddress();
  const evmAddress20 = useEvmAddress20();
  const { nativeBalances, liquidBalances } = useParachainBalances();
  const { read: readErc20 } = useContract(erc20Abi);
  const { read: readLiquidErc20 } = useContract(LIQUIFIER_TG_TOKEN_ABI);

  const [balance, setBalance] = useState<
    BN | null | typeof EMPTY_VALUE_PLACEHOLDER
  >(EMPTY_VALUE_PLACEHOLDER);

  const parachainBalances = isNative ? nativeBalances : liquidBalances;
  const isAccountConnected = substrateAddress !== null || evmAddress20 !== null;

  useEffect(() => {
    // Account is not connected. Reset balance to a placeholder.
    if (!isAccountConnected) {
      setBalance(EMPTY_VALUE_PLACEHOLDER);

      return;
    } else if (isLsErc20TokenId(protocolId)) {
      // Can't determine ERC20 balance without an active EVM account.
      if (evmAddress20 === null) {
        setBalance(EMPTY_VALUE_PLACEHOLDER);

        return;
      }

      const tokenDef = LS_ERC20_TOKEN_MAP[protocolId];
      const target = isNative ? readErc20 : readLiquidErc20;

      // Still loading.
      if (target === null) {
        setBalance(null);

        return;
      }

      // TODO: This only loads the balance once. Make it so it updates every few seconds that way the it responds to any balance changes that may occur, not just when loading the site initially. Like a subscription.
      target({
        address: tokenDef.address,
        functionName: 'balanceOf',
        args: [evmAddress20],
      }).then((result) => setBalance(new BN(result.toString())));
    } else {
      if (parachainBalances === null) {
        return;
      }

      assert(isLsParachainToken(protocolId));

      const newBalance = parachainBalances.get(protocolId) ?? BN_ZERO;

      setBalance(newBalance);
    }
  }, [
    evmAddress20,
    isAccountConnected,
    isNative,
    parachainBalances,
    protocolId,
    readErc20,
    readLiquidErc20,
  ]);

  return balance;
};

export default useAgnosticLsBalance;
