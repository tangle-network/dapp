import type {
  Enum,
  f32,
  f64,
  i8,
  i16,
  i32,
  i128,
  i256,
  isize,
  u8,
  u16,
  u32,
  u128,
  u256,
  usize,
} from '@polkadot/types';
import type {
  Evaluate,
  MappedObjectType,
  OmitByValue,
} from '@webb-tools/dapp-types/utils/types';

/**
 * @description All enums from `@polkadot/types` will have the same convention:
 * - `as${EnumName}`: EnumName
 * - `is${EnumName}`: boolean
 * - `type`: string union of all enum variants
 * So this utility type will extract the EnumName from the `as${EnumName}`.
 *
 * @example
 *   interface Status extends Enum {
 *     isActive: boolean;
 *     isInactive: boolean;
 *     asInactive: u32;
 *     type: 'Active' | 'Inactive';
 *   }
 *
 *   // Expect: 'Inactive'
 *   type Keys = GetEnumAsKeys<keyof Status>;
 */
export type GetEnumAsKeys<Key extends keyof any> = Key extends `as${infer K}`
  ? K
  : never;

/**
 * @description Extract all `as${EnumName}` values from an Enum.
 *
 * @example
 *   interface Status extends Enum {
 *     isActive: boolean;
 *     isInactive: boolean;
 *     asInactive: u32;
 *     type: 'Active' | 'Inactive';
 *   }
 *
 *   // Expect: { asInactive: u32 }
 *   type Values = GetAsEnumValues<Status>;
 */
export type GetEnumAsValues<EnumType extends Enum> = OmitByValue<
  {
    [K in keyof EnumType]: K extends `as${string}` ? EnumType[K] : never;
  },
  never | undefined | null
>;

/**
 * @description Extract all `as${EnumName}` values from an Enum and convert them to primitive types
 * if possible.
 *
 * @example
 *   interface Status extends Enum {
 *     isActive: boolean;
 *     isInactive: boolean;
 *     asInactive: u32;
 *     type: 'Active' | 'Inactive';
 *   }
 *
 *   // Expect: { Inactive: number }
 *   type Values = GetAsEnumValues<Status>;
 */
export type AsEnumValuesToPrimitive<EmumType extends Enum> = MappedObjectType<
  OmitByValue<
    {
      [K in keyof EmumType as K extends `as${infer AsKey}`
        ? AsKey
        : K]: K extends `as${string}`
        ? EmumType[K] extends u8 | u16 | u32 | i8 | i16 | i32 | f32
          ? number
          : EmumType[K] extends f64 | u128 | u256 | usize | i128 | i256 | isize
            ? string
            : EmumType[K]
        : never;
    },
    never | undefined | null
  >
>;

/**
 * @description Transform an Polkadot Enum to a TypeScript type
 * with string union of all enum variants.
 *
 * @example
 *   interface Status extends Enum {
 *     isActive: boolean;
 *     isInactive: boolean;
 *     asInactive: u32;
 *     type: 'Active' | 'Inactive';
 *   }
 *
 *   // Expect: 'Active' | { Inactive: number }
 */
export type TransformEnum<EnumType extends Enum> =
  | Exclude<EnumType['type'], GetEnumAsKeys<keyof EnumType>>
  | Evaluate<
      AsEnumValuesToPrimitive<EnumType> extends Record<string, never>
        ? never
        : AsEnumValuesToPrimitive<EnumType>
    >;
