import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { erc20Abi } from 'viem';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import LIQUIFIER_TG_TOKEN_ABI from '../../../constants/liquidStaking/liquifierTgTokenAbi';
import {
  getLsProtocolDef,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import useContract from '../../../data/liquifier/useContract';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';

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
  const protocol = getLsProtocolDef(protocolId);

  // Reset balance to a placeholder when the active account is
  // disconnected.
  useEffect(() => {
    // Account is not connected. Reset balance to a placeholder.
    if (!isAccountConnected) {
      setBalance(EMPTY_VALUE_PLACEHOLDER);

      return;
    }
  }, [isAccountConnected]);

  // TODO: Make use of the `usePolling` hook here in order to refresh the balance every so often.
  useEffect(() => {
    if (protocol.type !== 'erc20' || evmAddress20 === null) {
      return;
    }

    const target = isNative ? readErc20 : readLiquidErc20;

    // Still loading.
    if (target === null) {
      setBalance(null);

      return;
    }

    target({
      address: protocol.address,
      functionName: 'balanceOf',
      args: [evmAddress20],
    }).then((result) => setBalance(new BN(result.toString())));
  }, [evmAddress20, isNative, protocol, readErc20, readLiquidErc20]);

  useEffect(() => {
    if (protocol.type !== 'parachain' || parachainBalances === null) {
      return;
    }

    const newBalance = parachainBalances.get(protocol.token) ?? BN_ZERO;

    setBalance(newBalance);
  }, [parachainBalances, protocol.token, protocol.type]);

  return balance;
};

export default useAgnosticLsBalance;
