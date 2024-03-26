import { PalletRolesProfileRecord } from '@polkadot/types/lookup';
import BN from 'bn.js';

import { RestakingService } from '../types';
import substrateRoleToServiceType from './substrateRoleToServiceType';

/**
 * Given a roles profile record (a tuple originating from chain,
 * consisting of a role and its restaked amount), convert it to
 * a tuple that this application can work with, which includes
 * the role type as an enum, and the amount restaked in that role.
 *
 * The main reason why this is needed is because the role types provided
 * by Polkadot JS are in a tedious format, which is a consequence of
 * Rust's sum type enums, which are not straightforward to map to
 * JavaScript/TypeScript.
 */
function convertRecordToAllocation(
  record: PalletRolesProfileRecord
): [RestakingService, BN] {
  const serviceType = substrateRoleToServiceType(record.role);

  // The amount being `None` simply means that it is zero.
  return [serviceType, record.amount.unwrapOr(new BN(0))];
}

export default convertRecordToAllocation;
