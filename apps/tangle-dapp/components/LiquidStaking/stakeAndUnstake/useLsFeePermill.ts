import { useCallback, useEffect } from 'react';

import { LS_REGISTRY_ADDRESS } from '../../../constants/liquidStaking/constants';
import LIQUIFIER_REGISTRY_ABI from '../../../constants/liquidStaking/liquifierRegistryAbi';
import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useParachainLsFees from '../../../data/liquidStaking/useParachainLsFees';
import useContractRead from '../../../data/liquifier/useContractRead';
import { ContractReadOptions } from '../../../data/liquifier/useContractReadOnce';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';

const useLsFeePermill = (protocolId: LsProtocolId, isMinting: boolean) => {
  const { result: parachainFees } = useParachainLsFees();

  const protocol = getLsProtocolDef(protocolId);

  const parachainFee =
    parachainFees === null
      ? null
      : isMinting
        ? parachainFees.mintFee
        : parachainFees.redeemFee;

  const getLiquifierFeeOptions = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_REGISTRY_ABI,
    'fee'
  > | null => {
    if (protocol.type !== 'liquifier') {
      return null;
    }

    return {
      address: LS_REGISTRY_ADDRESS,
      functionName: 'fee',
      // TODO: Need to confirm whether this is the actual expected address. What address is the Liquifier using for fees?
      args: [protocol.erc20TokenAddress],
    };
  }, [protocol]);

  const {
    value: rawLiquifierFeeOrError,
    setIsPaused: setIsLiquifierFeePaused,
  } = useContractRead(LIQUIFIER_REGISTRY_ABI, getLiquifierFeeOptions);

  // Pause liquifier fee fetching if the protocol is a parachain chain.
  // This helps prevent unnecessary contract read calls.
  useEffect(() => {
    setIsLiquifierFeePaused(protocol.type === 'parachain');
  }, [protocol.type, setIsLiquifierFeePaused]);

  // The fee should be returned as a per-mill value from the liquifier contract.
  const liquifierFeePermillOrError =
    rawLiquifierFeeOrError instanceof Error
      ? rawLiquifierFeeOrError
      : rawLiquifierFeeOrError === null
        ? null
        : Number(rawLiquifierFeeOrError);

  return protocol.type === 'parachain'
    ? parachainFee
    : liquifierFeePermillOrError;
};

export default useLsFeePermill;
