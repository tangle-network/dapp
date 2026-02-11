/**
 * Type definitions for TLV v2 schema codec.
 * Mirrors Solidity Types.BlueprintFieldKind and related structures.
 */

export enum BlueprintFieldKind {
  Void = 0,
  Bool = 1,
  Uint8 = 2,
  Int8 = 3,
  Uint16 = 4,
  Int16 = 5,
  Uint32 = 6,
  Int32 = 7,
  Uint64 = 8,
  Int64 = 9,
  Uint128 = 10,
  Int128 = 11,
  Uint256 = 12,
  Int256 = 13,
  Address = 14,
  Bytes32 = 15,
  FixedBytes = 16,
  String = 17,
  Bytes = 18,
  Optional = 19,
  Array = 20,
  List = 21,
  Struct = 22,
}

export interface SchemaField {
  kind: BlueprintFieldKind;
  name: string;
  arrayLength: number;
  children: SchemaField[];
}

export type DecodedValue =
  | { tag: 'void' }
  | { tag: 'bool'; value: boolean }
  | { tag: 'number'; value: bigint }
  | { tag: 'address'; value: string }
  | { tag: 'bytes32'; value: Uint8Array }
  | { tag: 'fixedBytes'; value: Uint8Array }
  | { tag: 'string'; value: string }
  | { tag: 'bytes'; value: Uint8Array }
  | { tag: 'optional'; present: boolean; inner?: DecodedValue }
  | { tag: 'array'; elements: DecodedValue[] }
  | { tag: 'list'; elements: DecodedValue[] }
  | { tag: 'struct'; fields: NamedDecodedField[] };

export interface NamedDecodedField {
  name: string;
  schema: SchemaField;
  value: DecodedValue;
}

export type FormFieldValue =
  | null
  | boolean
  | string
  | bigint
  | Uint8Array
  | { present: boolean; inner?: FormFieldValue }
  | FormFieldValue[];

export const getDefaultValue = (field: SchemaField): FormFieldValue => {
  switch (field.kind) {
    case BlueprintFieldKind.Void:
      return null;
    case BlueprintFieldKind.Bool:
      return false;
    case BlueprintFieldKind.Uint8:
    case BlueprintFieldKind.Uint16:
    case BlueprintFieldKind.Uint32:
    case BlueprintFieldKind.Int8:
    case BlueprintFieldKind.Int16:
    case BlueprintFieldKind.Int32:
    case BlueprintFieldKind.Uint64:
    case BlueprintFieldKind.Int64:
    case BlueprintFieldKind.Uint128:
    case BlueprintFieldKind.Int128:
    case BlueprintFieldKind.Uint256:
    case BlueprintFieldKind.Int256:
      return '0';
    case BlueprintFieldKind.Address:
    case BlueprintFieldKind.Bytes32:
    case BlueprintFieldKind.FixedBytes:
    case BlueprintFieldKind.Bytes:
    case BlueprintFieldKind.String:
      return '';
    case BlueprintFieldKind.Optional:
      return { present: false };
    case BlueprintFieldKind.Array: {
      const child = field.children[0];
      if (!child) {
        return [];
      }
      return Array.from({ length: field.arrayLength }, () =>
        getDefaultValue(child),
      );
    }
    case BlueprintFieldKind.List:
      return [];
    case BlueprintFieldKind.Struct:
      return field.children.map(getDefaultValue);
    default:
      return '';
  }
};
