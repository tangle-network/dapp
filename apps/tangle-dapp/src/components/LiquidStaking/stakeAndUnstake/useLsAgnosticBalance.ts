import { BN } from '@polkadot/util';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { useEffect, useState } from 'react';

import { LsNetworkId } from '../../../constants/liquidStaking/types';
import useBalances from '../../../data/balances/useBalances';
import useLsPoolBalance from '../../../data/liquidStaking/tangle/useLsPoolBalance';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useIsAccountConnected from '../../../hooks/useIsAccountConnected';
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

const useLsAgnosticBalance = (isNative: boolean) => {
  const { free: tangleFreeBalance } = useBalances();
  const { lsProtocolId, lsNetworkId } = useLsStore();
  const tangleAssetBalance = useLsPoolBalance();

  const [balance, setBalance] = useState<
    BN | null | typeof EMPTY_VALUE_PLACEHOLDER
  >(EMPTY_VALUE_PLACEHOLDER);

  const isAccountConnected = useIsAccountConnected();
  const protocol = getLsProtocolDef(lsProtocolId);

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
  }, [isAccountConnected, isNative, lsProtocolId]);

  const isLsTangleNetwork =
    lsNetworkId === LsNetworkId.TANGLE_LOCAL ||
    lsNetworkId === LsNetworkId.TANGLE_MAINNET ||
    lsNetworkId === LsNetworkId.TANGLE_TESTNET;

  // Update the balance to the Tangle balance when the Tangle
  // network is the active network.
  useEffect(() => {
    if (!isLsTangleNetwork) {
      return;
    }
    // Relevant balance hasn't loaded yet or isn't available.
    else if (
      (isNative && tangleFreeBalance === null) ||
      (!isNative && tangleAssetBalance === null)
    ) {
      return;
    }

    setBalance(
      createBalanceStateUpdater(
        isNative ? tangleFreeBalance : tangleAssetBalance,
      ),
    );
  }, [
    protocol.networkId,
    tangleFreeBalance,
    isLsTangleNetwork,
    tangleAssetBalance,
    isNative,
  ]);

  return balance;
};

export default useLsAgnosticBalance;
