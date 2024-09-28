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
  if (registrationHook.type === 'Evm') {
    return {
      Evm: registrationHook.asEvm.toHex(),
    } as const;
  }

  return registrationHook.type;
}

export function toPrimitiveServiceRequestHook(requestHook: ServiceRequestHook) {
  if (requestHook.type === 'Evm') {
    return {
      Evm: requestHook.asEvm.toHex(),
    } as const;
  }

  return requestHook.type;
}

export function toPrimitiveJobResultVerifier(verifier: JobResultVerifier) {
  if (verifier.type === 'Evm') {
    return {
      Evm: verifier.asEvm.toHex(),
    } as const;
  }

  return verifier.type;
}

export function toPrimitiveJobMetadata({ name, description }: JobMetadata) {
  return {
    name: u8aToString(name),
    description: optionalBytesToString(description),
  } as const;
}

export function toPrimitiveGadget(gadget: Gadget) {
  if (gadget.type === 'Container') {
    return toPrimitiveContainerGadget(gadget.asContainer);
  }

  if (gadget.type === 'Native') {
    return toPrimitiveNativeGadget(gadget.asNative);
  }

  if (gadget.type === 'Wasm') {
    return toPrimitiveWasmGadget(gadget.asWasm);
  }

  throw new Error('Unknown Gadget type');
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
  if (fetcher.type === 'ContainerImage')
    return {
      ContainerImage: toPrimitiveContainerImage(fetcher.asContainerImage),
    } as const;

  if (fetcher.type === 'Github')
    return {
      Github: toPrimitiveGithubFetcher(fetcher.asGithub),
    } as const;

  if (fetcher.type === 'Ipfs')
    return {
      Ipfs: u8aToString(fetcher.asIpfs),
    } as const;

  if (fetcher.type === 'Testing')
    return {
      Testing: toPrimitiveTestingFetcher(fetcher.asTesting),
    } as const;

  throw new Error('Unknown GadgetSourceFetcher type');
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
  if (fieldType.type === 'Optional') {
    return {
      Optional: toPrimitiveFieldType(fieldType.asOptional),
    } as const;
  }

  if (fieldType.type === 'Array') {
    return {
      Array: [
        fieldType.asArray[0].toNumber(),
        toPrimitiveFieldType(fieldType.asArray[1]),
      ],
    } as const;
  }

  if (fieldType.type === 'List') {
    return {
      List: toPrimitiveFieldType(fieldType.asList),
    } as const;
  }

  if (fieldType.type === 'Struct') {
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

  return fieldType.type;
}

const optionalBytesToString = (bytes: Option<Bytes>) =>
  bytes.isSome ? u8aToString(bytes.unwrap()) : null;
