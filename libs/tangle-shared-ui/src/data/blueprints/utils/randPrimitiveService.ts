import toPrimitiveService from './toPrimitiveService';

function randPrimitiveService(
  id: number,
  operatorAccountAddr: string,
): ReturnType<typeof toPrimitiveService> {
  return {
    id: 10000 + id,
    blueprint: id,
    ownerAccount: operatorAccountAddr,
    permittedCallers: [],
    operators: [operatorAccountAddr, operatorAccountAddr, operatorAccountAddr],
    ttl: 1000,
  };
}

export default randPrimitiveService;
