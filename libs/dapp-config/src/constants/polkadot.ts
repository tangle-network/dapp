import { TypeRegistry } from '@polkadot/types';
import { defaults as addressDefaults } from '@polkadot/util-crypto/address/defaults';

export const TYPE_REGISTRY = new TypeRegistry();

export const DEFAULT_SS58 = TYPE_REGISTRY.createType(
  'u32',
  addressDefaults.prefix,
);
