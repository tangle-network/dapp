import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import {
  LsNetworkId,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import useLsAgnosticBalance from './useLsAgnosticBalance';

type LsSpendingLimits = {
  minSpendable: BN | null;
  maxSpendable: BN | null;
};

const useLsSpendingLimits = (
  isNative: boolean,
  protocolId: LsProtocolId,
): LsSpendingLimits => {
  const { balance } = useLsAgnosticBalance(isNative);

  const { result: existentialDepositAmount } = useApi(
    useCallback((api) => api.consts.balances.existentialDeposit, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: minimumMintingAmount } = useApiRx(
    useCallback(
      (api) => {
        const protocol = getLsProtocolDef(protocolId);

        if (protocol.networkId !== LsNetworkId.TANGLE_RESTAKING_PARACHAIN) {
          return null;
        }

        return api.query.lstMinting.minimumMint({
          Native: protocol.currency,
        });
      },
      [protocolId],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: minimumRedeemAmount } = useApiRx(
    useCallback(
      (api) => {
        const protocol = getLsProtocolDef(protocolId);

        if (protocol.networkId !== LsNetworkId.TANGLE_RESTAKING_PARACHAIN) {
          return null;
        }

        return api.query.lstMinting.minimumRedeem({
          Native: protocol.currency,
        });
      },
      [protocolId],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const mintingOrRedeemingAmount = isNative
    ? minimumMintingAmount
    : minimumRedeemAmount;

  const minSpendable = useMemo(() => {
    // TODO: Add liquifier cases as well (enough to cover fees?).

    if (
      mintingOrRedeemingAmount === null ||
      existentialDepositAmount === null
    ) {
      return null;
    }

    return BN.max(mintingOrRedeemingAmount, existentialDepositAmount);
  }, [existentialDepositAmount, mintingOrRedeemingAmount]);

  // TODO: Properly handle error state of maxSpendable.
  return { minSpendable, maxSpendable: balance instanceof BN ? balance : null };
};

export default useLsSpendingLimits;
