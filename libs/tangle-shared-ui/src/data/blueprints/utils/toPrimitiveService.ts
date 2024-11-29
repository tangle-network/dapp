import { Struct, u64, Vec } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';

/** @name Service */
interface Service extends Struct {
  readonly id: u64;
  readonly blueprint: u64;
  readonly owner: AccountId32;
  readonly permittedCallers: Vec<AccountId32>;
  readonly operators: Vec<AccountId32>;
  readonly ttl: u64;
}

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
