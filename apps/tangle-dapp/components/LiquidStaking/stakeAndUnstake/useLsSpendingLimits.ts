import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import useAgnosticLsBalance from './useAgnosticLsBalance';

const useLsSpendingLimits = (isNative: boolean, protocolId: LsProtocolId) => {
  const balance = useAgnosticLsBalance(isNative, protocolId);

  const { result: existentialDepositAmount } = useApi(
    useCallback((api) => api.consts.balances.existentialDeposit, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: minimumMintingAmount } = useApiRx(
    useCallback(
      (api) => {
        const protocol = getLsProtocolDef(protocolId);

        if (protocol.type !== 'parachain') {
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

        if (protocol.type !== 'parachain') {
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
    // TODO: Add ERC20 cases as well.

    if (
      mintingOrRedeemingAmount === null ||
      existentialDepositAmount === null
    ) {
      return null;
    }

    return BN.max(mintingOrRedeemingAmount, existentialDepositAmount);
  }, [existentialDepositAmount, mintingOrRedeemingAmount]);

  const maxSpendable = (() => {
    if (balance === null || typeof balance === 'string') {
      return null;
    }

    return balance;
  })();

  return { minSpendable, maxSpendable };
};

export default useLsSpendingLimits;
