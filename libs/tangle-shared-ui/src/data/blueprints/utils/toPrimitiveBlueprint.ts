import type {
  Bytes,
  Enum,
  Option,
  Struct,
  u64,
  U8aFixed,
  Vec,
} from '@polkadot/types';
import { H160 } from '@polkadot/types/interfaces';
import {
  TanglePrimitivesServicesFieldFieldType,
  TanglePrimitivesServicesJobDefinition,
  TanglePrimitivesServicesServiceBlueprint,
} from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import { u8aToString } from '@polkadot/util';

/** @name WasmRuntime */
interface WasmRuntime extends Enum {
  readonly isWasmtime: boolean;
  readonly isWasmer: boolean;
  readonly type: 'Wasmtime' | 'Wasmer';
}

/** @name WasmGadget */
interface WasmGadget extends Struct {
  readonly runtime: WasmRuntime;
  readonly sources: Vec<GadgetSource>;
}

/** @name TestFetcher */
interface TestFetcher extends Struct {
  readonly cargoPackage: Bytes;
  readonly cargoBin: Bytes;
  readonly basePath: Bytes;
}

/** @name ServiceRequestHook */
interface ServiceRequestHook extends Enum {
  readonly isNone: boolean;
  readonly isEvm: boolean;
  readonly asEvm: H160;
  readonly type: 'None' | 'Evm';
}

/** @name ServiceRegistrationHook */
interface ServiceRegistrationHook extends Enum {
  readonly isNone: boolean;
  readonly isEvm: boolean;
  readonly asEvm: H160;
  readonly type: 'None' | 'Evm';
}

/** @name ServiceMetadata */
interface ServiceMetadata extends Struct {
  readonly name: Bytes;
  readonly description: Option<Bytes>;
  readonly author: Option<Bytes>;
  readonly category: Option<Bytes>;
  readonly codeRepository: Option<Bytes>;
  readonly logo: Option<Bytes>;
  readonly website: Option<Bytes>;
  readonly license: Option<Bytes>;
}

/** @name ServiceBlueprint */
interface ServiceBlueprint extends Struct {
  readonly metadata: ServiceMetadata;
  readonly jobs: Vec<JobDefinition>;
  readonly registrationHook: ServiceRegistrationHook;
  readonly registrationParams: Vec<FieldFieldType>;
  readonly requestHook: ServiceRequestHook;
  readonly requestParams: Vec<FieldFieldType>;
  readonly gadget: Gadget;
}

/** @name OperatingSystem */
interface OperatingSystem extends Enum {
  readonly isUnknown: boolean;
  readonly isLinux: boolean;
  readonly isWindows: boolean;
  readonly isMacOS: boolean;
  readonly isBsd: boolean;
  readonly type: 'Unknown' | 'Linux' | 'Windows' | 'MacOS' | 'Bsd';
}

/** @name NativeGadget */
interface NativeGadget extends Struct {
  readonly sources: Vec<GadgetSource>;
}

/** @name JobResultVerifier */
interface JobResultVerifier extends Enum {
  readonly isNone: boolean;
  readonly isEvm: boolean;
  readonly asEvm: H160;
  readonly type: 'None' | 'Evm';
}

/** @name JobMetadata */
interface JobMetadata extends Struct {
  readonly name: Bytes;
  readonly description: Option<Bytes>;
}

/** @name JobDefinition */
interface JobDefinition extends Struct {
  readonly metadata: JobMetadata;
  readonly params: Vec<FieldFieldType>;
  readonly result: Vec<FieldFieldType>;
  readonly verifier: JobResultVerifier;
}

/** @name ImageRegistryFetcher */
interface ImageRegistryFetcher extends Struct {
  readonly registry_: Bytes;
  readonly image: Bytes;
  readonly tag: Bytes;
}

/** @name GithubFetcher */
interface GithubFetcher extends Struct {
  readonly owner: Bytes;
  readonly repo: Bytes;
  readonly tag: Bytes;
  readonly binaries: Vec<GadgetBinary>;
}

/** @name GadgetSource */
interface GadgetSource extends Struct {
  readonly fetcher: GadgetSourceFetcher;
}

/** @name GadgetSourceFetcher */
interface GadgetSourceFetcher extends Enum {
  readonly isIpfs: boolean;
  readonly asIpfs: Bytes;
  readonly isGithub: boolean;
  readonly asGithub: GithubFetcher;
  readonly isContainerImage: boolean;
  readonly asContainerImage: ImageRegistryFetcher;
  readonly isTesting: boolean;
  readonly asTesting: TestFetcher;
  readonly type: 'Ipfs' | 'Github' | 'ContainerImage' | 'Testing';
}

/** @name GadgetBinary */
interface GadgetBinary extends Struct {
  readonly arch: Architecture;
  readonly os: OperatingSystem;
  readonly name: Bytes;
  readonly sha256: U8aFixed;
}

/** @name Architecture */
interface Architecture extends Enum {
  readonly isWasm: boolean;
  readonly isWasm64: boolean;
  readonly isWasi: boolean;
  readonly isWasi64: boolean;
  readonly isAmd: boolean;
  readonly isAmd64: boolean;
  readonly isArm: boolean;
  readonly isArm64: boolean;
  readonly isRiscV: boolean;
  readonly isRiscV64: boolean;
  readonly type:
    | 'Wasm'
    | 'Wasm64'
    | 'Wasi'
    | 'Wasi64'
    | 'Amd'
    | 'Amd64'
    | 'Arm'
    | 'Arm64'
    | 'RiscV'
    | 'RiscV64';
}

/** @name Gadget */
interface Gadget extends Enum {
  readonly isWasm: boolean;
  readonly asWasm: WasmGadget;
  readonly isNative: boolean;
  readonly asNative: NativeGadget;
  readonly isContainer: boolean;
  readonly asContainer: ContainerGadget;
  readonly type: 'Wasm' | 'Native' | 'Container';
}

/** @name ContainerGadget */
interface ContainerGadget extends Struct {
  readonly sources: Vec<GadgetSource>;
}

/** @name FieldFieldType */
interface FieldFieldType extends Enum {
  readonly isVoid: boolean;
  readonly isBool: boolean;
  readonly isUint8: boolean;
  readonly isInt8: boolean;
  readonly isUint16: boolean;
  readonly isInt16: boolean;
  readonly isUint32: boolean;
  readonly isInt32: boolean;
  readonly isUint64: boolean;
  readonly isInt64: boolean;
  readonly isText: boolean;
  readonly isBytes: boolean;
  readonly isOptional: boolean;
  readonly asOptional: FieldFieldType;
  readonly isArray: boolean;
  readonly asArray: ITuple<[u64, FieldFieldType]>;
  readonly isList: boolean;
  readonly asList: FieldFieldType;
  readonly isStruct: boolean;
  readonly asStruct: ITuple<
    [FieldFieldType, Vec<ITuple<[FieldFieldType, FieldFieldType]>>]
  >;
  readonly isAccountId: boolean;
  readonly type:
    | 'Void'
    | 'Bool'
    | 'Uint8'
    | 'Int8'
    | 'Uint16'
    | 'Int16'
    | 'Uint32'
    | 'Int32'
    | 'Uint64'
    | 'Int64'
    | 'Text'
    | 'Bytes'
    | 'Optional'
    | 'Array'
    | 'List'
    | 'Struct'
    | 'AccountId';
}

export function toPrimitiveBlueprint({
  metadata,
  jobs,
  registrationParams,
  requestParams,
  gadget,
}: ServiceBlueprint | TanglePrimitivesServicesServiceBlueprint) {
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
}: JobDefinition | TanglePrimitivesServicesJobDefinition) {
  return {
    metadata: toPrimitiveJobMetadata(metadata),
    params: params.map(toPrimitiveFieldType),
    result: result.map(toPrimitiveFieldType),
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
