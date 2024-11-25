import type { Service } from '@webb-tools/protocol-substrate-types';

export default function toPrimitiveService({
  id,
  blueprint,
  owner,
  permittedCallers,
  operators,
  ttl,
}: Service) {
  return {
    id: id.toNumber(),
    blueprint: blueprint.toNumber(),
    ownerAccount: owner.toString(),
    permittedCallers: permittedCallers.map((caller) => caller.toString()),
    operators: operators.map((operator) => operator.toString()),
    ttl: ttl.toNumber(),
  } as const;
}
