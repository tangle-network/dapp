import { BN } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useApi from '../../../hooks/useApi';
import useApiRx from '../../../hooks/useApiRx';
import useAgnosticLsBalance from './useAgnosticLsBalance';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '../../../../../libs/webb-ui-components/src/constants/networks';

const useLsSpendingLimits = (isNative: boolean, protocolId: LsProtocolId) => {
  const balance = useAgnosticLsBalance(isNative, protocolId);

  const { result: existentialDepositAmount } = useApi(
    useCallback((api) => api.consts.balances.existentialDeposit, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: minimumMintingAmount } = useApiRx(
    useCallback(
      (api) =>
        api.query.lstMinting.minimumMint({
          Native: selectedProtocol.currency,
        }),
      [selectedProtocol.currency],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const { result: minimumRedeemAmount } = useApiRx(
    useCallback(
      (api) =>
        api.query.lstMinting.minimumRedeem({
          Native: selectedProtocol.currency,
        }),
      [selectedProtocol.currency],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const mintingOrRedeemingAmount = isNative
    ? minimumMintingAmount
    : minimumRedeemAmount;

  const minSpendable = useMemo(() => {
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
