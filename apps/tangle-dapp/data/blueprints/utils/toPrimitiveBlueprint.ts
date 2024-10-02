import type { Bytes, Option } from '@polkadot/types';
import {
  TanglePrimitivesServicesFieldFieldType,
  TanglePrimitivesServicesJobDefinition,
  TanglePrimitivesServicesServiceBlueprint,
} from '@polkadot/types/lookup';
import { u8aToString } from '@polkadot/util';
import type {
  Architecture,
  ContainerGadget,
  FieldFieldType,
  Gadget,
  GadgetBinary,
  GadgetSource,
  GadgetSourceFetcher,
  GithubFetcher,
  ImageRegistryFetcher,
  JobDefinition,
  JobMetadata,
  JobResultVerifier,
  NativeGadget,
  OperatingSystem,
  ServiceBlueprint,
  ServiceMetadata,
  ServiceRegistrationHook,
  ServiceRequestHook,
  TestFetcher,
  WasmGadget,
  WasmRuntime,
} from '@webb-tools/tangle-substrate-types';

export function toPrimitiveBlueprint({
  metadata,
  jobs,
  registrationHook,
  registrationParams,
  requestHook,
  requestParams,
  gadget,
}: ServiceBlueprint | TanglePrimitivesServicesServiceBlueprint) {
  return {
    metadata: toPrimitiveServiceMetadata(metadata),
    jobs: jobs.map(toPrimitiveJobDefinition),
    registrationHook: toPrimitiveServiceRegistrationHook(registrationHook),
    requestHook: toPrimitiveServiceRequestHook(requestHook),
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
  verifier,
}: JobDefinition | TanglePrimitivesServicesJobDefinition) {
  return {
    metadata: toPrimitiveJobMetadata(metadata),
    params: params.map(toPrimitiveFieldType),
    result: result.map(toPrimitiveFieldType),
    verifier: toPrimitiveJobResultVerifier(verifier),
  } as const;
}

export function toPrimitiveServiceRegistrationHook(
  registrationHook: ServiceRegistrationHook,
) {
  switch (registrationHook.type) {
    case 'Evm':
      return {
        Evm: registrationHook.asEvm.toHex(),
      } as const;

    default:
      return registrationHook.type;
  }
}

export function toPrimitiveServiceRequestHook(requestHook: ServiceRequestHook) {
  switch (requestHook.type) {
    case 'Evm':
      return {
        Evm: requestHook.asEvm.toHex(),
      } as const;

    default:
      return requestHook.type;
  }
}

export function toPrimitiveJobResultVerifier(verifier: JobResultVerifier) {
  switch (verifier.type) {
    case 'Evm':
      return {
        Evm: verifier.asEvm.toHex(),
      } as const;

    default:
      return verifier.type;
  }
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

export function toPrimitiveGadgetSourceFetcher(fetcher: GadgetSourceFetcher) {
  switch (fetcher.type) {
    case 'ContainerImage':
      return {
        ContainerImage: toPrimitiveContainerImage(fetcher.asContainerImage),
      } as const;

    case 'Github':
      return {
        Github: toPrimitiveGithubFetcher(fetcher.asGithub),
      } as const;

    case 'Ipfs':
      return {
        Ipfs: u8aToString(fetcher.asIpfs),
      } as const;

    case 'Testing':
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

type PrimitiveFieldType =
  | { Optional: PrimitiveFieldType }
  | { Array: [number, PrimitiveFieldType] }
  | { List: PrimitiveFieldType }
  | { Struct: [PrimitiveFieldType, [PrimitiveFieldType, PrimitiveFieldType][]] }
  | FieldFieldType['type']
  | TanglePrimitivesServicesFieldFieldType['type'];

export function toPrimitiveFieldType(
  fieldType: FieldFieldType | TanglePrimitivesServicesFieldFieldType,
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
      const [first, second] = fieldType.asStruct;
      return {
        Struct: [
          toPrimitiveFieldType(first),
          second.map<[PrimitiveFieldType, PrimitiveFieldType]>(
            ([first, second]) =>
              [
                toPrimitiveFieldType(first),
                toPrimitiveFieldType(second),
              ] as const,
          ),
        ],
      } as const;
    }

    default:
      return fieldType.type;
  }
}

const optionalBytesToString = (bytes: Option<Bytes>) =>
  bytes.isSome ? u8aToString(bytes.unwrap()) : null;
