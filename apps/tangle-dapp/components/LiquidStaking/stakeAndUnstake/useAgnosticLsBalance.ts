import { BN, BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { erc20Abi } from 'viem';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import LIQUIFIER_TG_TOKEN_ABI from '../../../constants/liquidStaking/liquifierTgTokenAbi';
import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import usePolling from '../../../data/liquidStaking/usePolling';
import useContractReadOnce from '../../../data/liquifier/useContractReadOnce';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';

const useAgnosticLsBalance = (isNative: boolean, protocolId: LsProtocolId) => {
  const substrateAddress = useSubstrateAddress();
  const evmAddress20 = useEvmAddress20();
  const { nativeBalances, liquidBalances } = useParachainBalances();

  // TODO: Why not use the subscription hook variants (useContractRead) instead of manually utilizing usePolling?
  const readErc20 = useContractReadOnce(erc20Abi);
  const readLiquidErc20 = useContractReadOnce(LIQUIFIER_TG_TOKEN_ABI);

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

  const erc20BalanceFetcher = useCallback(() => {
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
      address: isNative ? protocol.address : protocol.liquifierTgTokenAddress,
      functionName: 'balanceOf',
      args: [evmAddress20],
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
  }, [evmAddress20, isNative, protocol, readErc20, readLiquidErc20]);

  usePolling({ fetcher: erc20BalanceFetcher });

  useEffect(() => {
    if (protocol.type !== 'parachain' || parachainBalances === null) {
      return;
    }

    const newBalance = parachainBalances.get(protocol.token) ?? BN_ZERO;

    setBalance((prevBalance) => {
      // Do not update the balance state with a new BN instance if
      // it is the same as the current balance.
      if (prevBalance?.toString() === newBalance.toString()) {
        return prevBalance;
      }

      return newBalance;
    });
  }, [parachainBalances, protocol.token, protocol.type]);

  return balance;
};

export default useAgnosticLsBalance;
