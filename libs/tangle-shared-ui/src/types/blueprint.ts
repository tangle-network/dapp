import { TanglePrimitivesServicesFieldFieldType } from '@polkadot/types/lookup';

export const basePrimitiveTypeList = [
  'Uint8',
  'Int8',
  'Uint16',
  'Int16',
  'Uint32',
  'Int32',
  'Uint64',
  'Int64',
  'AccountId',
  'String',
  'Bool',
] as const;

export const primitiveTypeList = [
  ...basePrimitiveTypeList,
  'Array',
  'List',
  'Struct',
] as const;

export type PrimitiveFieldType =
  | { Optional: PrimitiveFieldType }
  | { Array: [number, PrimitiveFieldType] }
  | { List: PrimitiveFieldType }
  | { Struct: PrimitiveFieldType[] }
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
      Optional: PrimitiveField | null;
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
      Array: PrimitiveField[];
    }
  | {
      List: [PrimitiveFieldType, PrimitiveField[]];
    }
  | {
      Struct: PrimitiveField[];
    }
  | {
      AccountId: string;
    };

export type Blueprint = {
  id: bigint;
  name: string;
  author: string;
  deployer: string;
  registrationParams: PrimitiveFieldType[];
  requestParams: PrimitiveFieldType[];
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
