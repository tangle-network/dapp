import { toPrimitiveService } from './toPrimitiveService';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

const randPrimitiveService = (
  id: bigint,
  operatorAccountAddr: SubstrateAddress,
): ReturnType<typeof toPrimitiveService> => {
  return {
    id: BigInt(10000) + id,
    blueprint: id,
    ownerAccount: operatorAccountAddr,
    permittedCallers: [],
    operatorSecurityCommitments: [],
    securityRequirements: [],
    membershipModel: {
      Dynamic: {
        minOperators: 1,
        maxOperators: 10,
      },
      type: 'Dynamic',
      membershipModelValue: {
        minOperators: 1,
        maxOperators: 10,
      },
    },
    ttl: 1000,
  };
};

export default randPrimitiveService;
