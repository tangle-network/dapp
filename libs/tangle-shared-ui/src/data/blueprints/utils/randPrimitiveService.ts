import toPrimitiveService from './toPrimitiveService';

function randPrimitiveService(
  id: number,
  operatorAccountAddr: string,
): ReturnType<typeof toPrimitiveService> {
  return {
    id: id,
    blueprint: id,
    ownerAccount: operatorAccountAddr,
    permittedCallers: [],
    operators: [operatorAccountAddr],
    ttl: 1000,
  };
}

export default randPrimitiveService;
