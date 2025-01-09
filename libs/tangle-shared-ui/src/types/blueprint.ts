import { TanglePrimitivesServicesFieldFieldType } from '@polkadot/types/lookup';
import { FieldFieldType } from '@webb-tools/tangle-substrate-types';

export type PrimitiveFieldType =
  | { Optional: PrimitiveFieldType }
  | { Array: [number, PrimitiveFieldType] }
  | { List: PrimitiveFieldType }
  | { Struct: [string, [string, PrimitiveFieldType][]] }
  | Exclude<FieldFieldType['type'], 'Optional' | 'Array' | 'List' | 'Struct'>
  | Exclude<
      TanglePrimitivesServicesFieldFieldType['type'],
      'Optional' | 'Array' | 'List' | 'Struct'
    >;

export type Blueprint = {
  id: string;
  name: string;
  author: string;
  registrationParams: PrimitiveFieldType[];
  imgUrl: string | null;
  category: string | null;
  description: string | null;
  restakersCount: number | null;
  operatorsCount: number | null;
  tvl: string | null;
  isBoosted?: boolean;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
};
