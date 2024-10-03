import {
  LsNetworkId,
  LsProtocolId,
} from '../../../constants/liquidStaking/types';
import useParachainLsFees from '../../../data/liquidStaking/parachain/useParachainLsFees';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';

const useLsFeePercentage = (
  protocolId: LsProtocolId,
  isStaking: boolean,
): number | Error | null => {
  const { result: parachainFees } = useParachainLsFees();

  const protocol = getLsProtocolDef(protocolId);

  const parachainFee =
    parachainFees === null
      ? null
      : isStaking
        ? parachainFees.mintFeePercentage
        : parachainFees.redeemFeePercentage;

  switch (protocol.networkId) {
    case LsNetworkId.TANGLE_RESTAKING_PARACHAIN:
      return parachainFee;
    // Tangle networks with the `lst` pallet have no fees for
    // joining or leaving pools as of now.
    case LsNetworkId.TANGLE_LOCAL:
    case LsNetworkId.TANGLE_MAINNET:
    case LsNetworkId.TANGLE_TESTNET:
      return 0;
  }
};

export default useLsFeePercentage;
