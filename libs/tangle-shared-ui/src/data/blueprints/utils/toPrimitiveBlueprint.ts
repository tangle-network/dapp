import type { Bytes, Option } from '@polkadot/types';
import {
  TanglePrimitivesServicesFieldFieldType,
  TanglePrimitivesServicesJobsJobDefinition,
  TanglePrimitivesServicesServiceServiceBlueprint,
} from '@polkadot/types/lookup';
import { u8aToString } from '@polkadot/util';
import type {
  JobDefinition,
  ServiceBlueprint,
  ServiceMetadata,
} from '@tangle-network/tangle-substrate-types';
import { PrimitiveFieldType } from '../../../types/blueprint';

export const toPrimitiveBlueprint = ({
  metadata,
  jobs,
  registrationParams,
  requestParams,
}: ServiceBlueprint | TanglePrimitivesServicesServiceServiceBlueprint) => {
  return {
    metadata: toPrimitiveServiceMetadata(metadata),
    jobs: jobs.map(toPrimitiveJobDefinition),
    registrationParams: registrationParams.map(toPrimitiveFieldType),
    requestParams: requestParams.map(toPrimitiveFieldType),
  };
};

const toPrimitiveServiceMetadata = ({
  name,
  description,
  author,
  category,
  codeRepository,
  logo,
  website,
  license,
}: ServiceMetadata) => {
  return {
    name: u8aToString(name),
    description: optionalBytesToString(description),
    author: optionalBytesToString(author),
    category: optionalBytesToString(category),
    codeRepository: optionalBytesToString(codeRepository),
    logo: optionalBytesToString(logo),
    website: optionalBytesToString(website),
    license: optionalBytesToString(license),
  } as const;
};

const toPrimitiveJobDefinition = ({
  metadata,
  params,
  result,
}: JobDefinition | TanglePrimitivesServicesJobsJobDefinition) => {
  return {
    metadata: {
      name: u8aToString(metadata.name),
      description: optionalBytesToString(metadata.description),
    } as const,
    params: params.map(toPrimitiveFieldType),
    result: result.map(toPrimitiveFieldType),
  } as const;
};

const toPrimitiveFieldType = (
  fieldType: TanglePrimitivesServicesFieldFieldType,
): PrimitiveFieldType => {
  switch (fieldType.type) {
    case 'Optional':
      return {
        Optional: toPrimitiveFieldType(fieldType.asOptional),
      } as const;

    case 'Array':
      return {
        Array: [
          fieldType.asArray[0].toNumber(),
          toPrimitiveFieldType(fieldType.asArray[1]),
        ],
      } as const;

    case 'List':
      return {
        List: toPrimitiveFieldType(fieldType.asList),
      } as const;

    case 'Struct': {
      const struct = fieldType.asStruct;
      return {
        Struct: struct.map((fieldType) => toPrimitiveFieldType(fieldType)),
      } as const;
    }

    default:
      return fieldType.type;
  }
};

const optionalBytesToString = (bytes: Option<Bytes>) => {
  return bytes.isSome ? u8aToString(bytes.unwrap()) : null;
};
