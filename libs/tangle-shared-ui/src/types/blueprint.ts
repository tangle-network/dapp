import { TanglePrimitivesServicesFieldFieldType } from '@polkadot/types/lookup';
import { FieldFieldType } from '@tangle-network/tangle-substrate-types';

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

export type PrimitiveNumberFieldKeys =
  | 'Uint8'
  | 'Int8'
  | 'Uint16'
  | 'Int16'
  | 'Uint32'
  | 'Int32'
  | 'Uint64'
  | 'Int64';

export type PrimitiveField =
  | {
      None: null;
    }
  | {
      Bool: boolean;
    }
  | {
      [key in PrimitiveNumberFieldKeys]: number;
    }
  | {
      String: string;
    }
  | {
      Bytes: Uint8Array;
    }
  | {
      Array: PrimitiveField[];
    }
  | {
      List: PrimitiveField[];
    }
  | {
      Struct: [string, [string, PrimitiveField][]];
    }
  | {
      AccountId: string;
    };

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
