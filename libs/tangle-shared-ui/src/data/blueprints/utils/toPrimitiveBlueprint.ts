import type { Bytes, Option } from '@polkadot/types';
import {
  TanglePrimitivesServicesFieldFieldType,
  TanglePrimitivesServicesJobsJobDefinition,
  TanglePrimitivesServicesServiceServiceBlueprint,
} from '@polkadot/types/lookup';
import { u8aToString } from '@polkadot/util';
import type {
  Architecture,
  ContainerGadget,
  Gadget,
  GadgetBinary,
  GadgetSource,
  GadgetSourceFetcher,
  GithubFetcher,
  ImageRegistryFetcher,
  JobDefinition,
  JobMetadata,
  NativeGadget,
  OperatingSystem,
  ServiceBlueprint,
  ServiceMetadata,
  TestFetcher,
  WasmGadget,
  WasmRuntime,
} from '@tangle-network/tangle-substrate-types';
import { PrimitiveFieldType } from '../../../types/blueprint';

export function toPrimitiveBlueprint({
  metadata,
  jobs,
  registrationParams,
  requestParams,
  gadget,
}: ServiceBlueprint | TanglePrimitivesServicesServiceServiceBlueprint) {
  return {
    metadata: toPrimitiveServiceMetadata(metadata),
    jobs: jobs.map(toPrimitiveJobDefinition),
    registrationParams: registrationParams.map(toPrimitiveFieldType),
    requestParams: requestParams.map(toPrimitiveFieldType),
    gadget: toPrimitiveGadget(gadget),
  } as const;
}

export function toPrimitiveServiceMetadata({
  name,
  description,
  author,
  category,
  codeRepository,
  logo,
  website,
  license,
}: ServiceMetadata) {
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
}

function toPrimitiveJobDefinition({
  metadata,
  params,
  result,
}: JobDefinition | TanglePrimitivesServicesJobsJobDefinition) {
  return {
    metadata: toPrimitiveJobMetadata(metadata),
    params: params.map(toPrimitiveFieldType),
    result: result.map(toPrimitiveFieldType),
  } as const;
}

export function toPrimitiveJobMetadata({ name, description }: JobMetadata) {
  return {
    name: u8aToString(name),
    description: optionalBytesToString(description),
  } as const;
}

export function toPrimitiveGadget(gadget: Gadget) {
  switch (gadget.type) {
    case 'Container':
      return toPrimitiveContainerGadget(gadget.asContainer);

    case 'Native':
      return toPrimitiveNativeGadget(gadget.asNative);

    case 'Wasm':
      return toPrimitiveWasmGadget(gadget.asWasm);

    default:
      throw new Error('Unknown Gadget type');
  }
}

export function toPrimitiveWasmGadget({ runtime, sources }: WasmGadget) {
  return {
    runtime: toPrimitiveWasmRuntime(runtime),
    sources: sources.map(toPrimitiveGadgetSource),
  } as const;
}

export function toPrimitiveWasmRuntime(runtime: WasmRuntime) {
  return runtime.type;
}

export function toPrimitiveNativeGadget({ sources }: NativeGadget) {
  return {
    sources: sources.map(toPrimitiveGadgetSource),
  } as const;
}

export function toPrimitiveContainerGadget({ sources }: ContainerGadget) {
  return {
    sources: sources.map(toPrimitiveGadgetSource),
  } as const;
}

export function toPrimitiveGadgetSource(source: GadgetSource) {
  return {
    fetcher: toPrimitiveGadgetSourceFetcher(source.fetcher),
  } as const;
}

/**
 * @dev @polkadot/type-gen enum converter is not working for some reason
 * so we need to convert the type manually
 */
export function toPrimitiveGadgetSourceFetcher(fetcher: GadgetSourceFetcher) {
  switch (fetcher.type.toUpperCase()) {
    case 'ContainerImage'.toUpperCase():
      return {
        ContainerImage: toPrimitiveContainerImage(fetcher.asContainerImage),
      } as const;

    case 'Github'.toUpperCase():
      return {
        Github: toPrimitiveGithubFetcher(fetcher.asGithub),
      } as const;

    case 'Ipfs'.toUpperCase():
      return {
        Ipfs: u8aToString(fetcher.asIpfs),
      } as const;

    case 'Testing'.toUpperCase():
      return {
        Testing: toPrimitiveTestingFetcher(fetcher.asTesting),
      } as const;
    default:
      throw new Error('Unknown GadgetSourceFetcher type');
  }
}

export function toPrimitiveContainerImage({
  registry_,
  image,
  tag,
}: ImageRegistryFetcher) {
  return {
    registry_: u8aToString(registry_),
    image: u8aToString(image),
    tag: u8aToString(tag),
  } as const;
}

export function toPrimitiveGithubFetcher({
  owner,
  repo,
  tag,
  binaries,
}: GithubFetcher) {
  return {
    owner: u8aToString(owner),
    repo: u8aToString(repo),
    tag: u8aToString(tag),
    binaries: binaries.map(toPrimitiveGadgetBinary),
  } as const;
}

export function toPrimitiveTestingFetcher({
  cargoBin,
  cargoPackage,
  basePath,
}: TestFetcher) {
  return {
    cargoPackage: u8aToString(cargoPackage),
    cargoBin: u8aToString(cargoBin),
    basePath: u8aToString(basePath),
  } as const;
}

export function toPrimitiveGadgetBinary({
  arch,
  os,
  name,
  sha256,
}: GadgetBinary) {
  return {
    arch: toPrimitiveArchitecture(arch),
    os: toPrimitiveOperatingSystem(os),
    name: u8aToString(name),
    sha256,
  } as const;
}

export function toPrimitiveArchitecture(arch: Architecture) {
  return arch.type;
}

export function toPrimitiveOperatingSystem(os: OperatingSystem) {
  return os.type;
}

export function toPrimitiveFieldType(
  fieldType: TanglePrimitivesServicesFieldFieldType,
): PrimitiveFieldType {
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
}

const optionalBytesToString = (bytes: Option<Bytes>) =>
  bytes.isSome ? u8aToString(bytes.unwrap()) : null;
