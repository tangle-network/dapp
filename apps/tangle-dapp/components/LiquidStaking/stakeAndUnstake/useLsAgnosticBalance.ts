import { BN, BN_ZERO } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { erc20Abi } from 'viem';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import LIQUIFIER_TG_TOKEN_ABI from '../../../constants/liquidStaking/liquifierTgTokenAbi';
import {
  LsNetworkId,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';
import useBalances from '../../../data/balances/useBalances';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import usePolling from '../../../data/liquidStaking/usePolling';
import useContractReadOnce from '../../../data/liquifier/useContractReadOnce';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';

type BalanceUpdater = (
  prevBalance: BN | null | typeof EMPTY_VALUE_PLACEHOLDER,
) => BN | null | typeof EMPTY_VALUE_PLACEHOLDER;

const createBalanceStateUpdater = (
  newBalance: BN | null | typeof EMPTY_VALUE_PLACEHOLDER,
): BalanceUpdater => {
  return (prevBalance) => {
    // Do not trigger a state update for the same underlying balance
    // value. If it's not checked by strings, a state update with the
    // same underlying value would trigger an update due to object
    // references being different.
    if (newBalance?.toString() === prevBalance?.toString()) {
      return prevBalance;
    }
    // An account was just connected, and the balance is changing
    // from the empty placeholder -> loading state.
    else if (newBalance === null && prevBalance === EMPTY_VALUE_PLACEHOLDER) {
      return null;
    }
    // Attempting to switch from a stale value to a loading state.
    // Deny this request, since we only want to show a loading state
    // for the initial value. Return the stale balance.
    else if (prevBalance instanceof BN && newBalance === null) {
      return prevBalance;
    }

    return newBalance;
  };
};

const useLsAgnosticBalance = (isNative: boolean, protocolId: LsProtocolId) => {
  const activeAccountAddress = useActiveAccountAddress();
  const evmAddress20 = useEvmAddress20();
  const { nativeBalances, liquidBalances } = useParachainBalances();
  const { free: tangleBalance } = useBalances();

  // TODO: Why not use the subscription hook variants (useContractRead) instead of manually utilizing usePolling?
  const readErc20 = useContractReadOnce(erc20Abi);
  const readTgToken = useContractReadOnce(LIQUIFIER_TG_TOKEN_ABI);

  const [balance, setBalance] = useState<
    BN | null | typeof EMPTY_VALUE_PLACEHOLDER
  >(EMPTY_VALUE_PLACEHOLDER);

  const parachainBalances = isNative ? nativeBalances : liquidBalances;
  const isAccountConnected = activeAccountAddress !== null;
  const protocol = getLsProtocolDef(protocolId);

  // Reset balance to a placeholder when the active account is
  // disconnected, and to a loading state once an account is
  // connected.
  useEffect(() => {
    setBalance(isAccountConnected ? null : EMPTY_VALUE_PLACEHOLDER);
  }, [isAccountConnected]);

  // Reset the balance to the initial loading state when the protocol changes.
  useEffect(() => {
    if (isAccountConnected) {
      setBalance(null);
    }
  }, [isAccountConnected, isNative, protocolId]);

  const erc20BalanceFetcher = useCallback(() => {
    if (
      protocol.networkId !== LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER ||
      evmAddress20 === null
    ) {
      return;
    }

    const target = isNative ? readErc20 : readTgToken;

    // There is an account connected, but the target read contract
    // function is not yet ready (ie. the public client is being re-created).
    if (target === null) {
      setBalance(createBalanceStateUpdater(null));

      return;
    }

    return target({
      address: isNative
        ? protocol.erc20TokenAddress
        : protocol.tgTokenContractAddress,
      functionName: 'balanceOf',
      args: [evmAddress20],
    }).then((result) => {
      if (result instanceof Error) {
        return;
      }

      setBalance(createBalanceStateUpdater(new BN(result.toString())));
    });
  }, [evmAddress20, isNative, protocol, readErc20, readTgToken]);

  const isRefreshing = usePolling({
    // Pause polling if there's no active account.
    effect: isAccountConnected ? erc20BalanceFetcher : null,
  });

  // Update balance to the parachain balance when the restaking
  // parachain is the active network.
  useEffect(() => {
    if (
      protocol.networkId !== LsNetworkId.TANGLE_RESTAKING_PARACHAIN ||
      parachainBalances === null
    ) {
      return;
    }

    const newBalance = parachainBalances.get(protocol.token) ?? BN_ZERO;

    setBalance(createBalanceStateUpdater(newBalance));
  }, [parachainBalances, protocol.token, protocol.networkId]);

  // Update the balance to the Tangle balance when the Tangle
  // network is the active network.
  useEffect(() => {
    if (
      protocol.networkId !== LsNetworkId.TANGLE_MAINNET ||
      tangleBalance === null
    ) {
      return;
    }

    setBalance(createBalanceStateUpdater(tangleBalance));
  }, [protocol.networkId, tangleBalance]);

  return { balance, isRefreshing };
};

export default useLsAgnosticBalance;
