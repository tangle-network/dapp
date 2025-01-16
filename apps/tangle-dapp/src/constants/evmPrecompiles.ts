import { BN } from '@polkadot/util';
import {
  EvmAddress,
  SubstrateBytes32Address,
} from '@webb-tools/webb-ui-components/types/address';
import {
  AbiFunction,
  AbiParameter,
  Address,
  Hex,
  AbiFunction as ViemAbiFunction,
} from 'viem';
import RESTAKING_PRECOMPILE_ABI from '../abi/restaking';
import STAKING_PRECOMPILE_ABI from '../abi/staking';
import VESTING_PRECOMPILE_ABI from '../abi/vesting';
import BATCH_PRECOMPILE_ABI from '../abi/batch';
import BALANCES_ERC20_PRECOMPILE_ABI from '../abi/balancesErc20';
import LST_PRECOMPILE_ABI from '../abi/lst';

export enum Precompile {
  STAKING,
  VESTING,
  BATCH,
  BALANCES_ERC20,
  LST,
  RESTAKING,
}

/**
 * A mapping of Solidity types to TypeScript native types which
 * Viem accepts for ABI calls.
 */
type SolidityTypeMap = {
  address: EvmAddress;
  'address[]': EvmAddress[];
  bytes: Hex;
  'bytes[]': Hex[];
  bytes32: SubstrateBytes32Address;
  'bytes32[]': SubstrateBytes32Address[];
  uint8: number | bigint;
  'uint8[]': Array<number | bigint>;
  uint32: number | bigint;
  'uint32[]': number[];
  uint64: bigint | number;
  'uint64[]': Array<bigint | number>;
  uint256: bigint | number;
  'uint256[]': Array<bigint | number>;
  bool: boolean;
  'bool[]': boolean[];
  string: string;
  'string[]': string[];
};

/**
 * Convert a Solidity type to a TypeScript type.
 */
type ConvertSolidityType<T extends string> = T extends keyof SolidityTypeMap
  ? SolidityTypeMap[T]
  : never;

/**
 * Convert Solidity parameter types to TypeScript types.
 */
type ConvertParametersToTs<T extends readonly AbiParameter[]> = {
  [K in keyof T]: T[K] extends { type: infer S extends string }
    ? ConvertSolidityType<S>
    : never;
};

/**
 * Find an ABI function definition by its name.
 */
type FindFunctionByName<
  Abi extends readonly AbiFunction[],
  Name extends Abi[number]['name'],
> = Extract<Abi[number], { name: Name }>;

/**
 * Get the argument types of an ABI function by its name.
 */
export type FindAbiArgsOf<
  T extends readonly AbiFunction[],
  Name extends T[number]['name'],
> = ConvertParametersToTs<FindFunctionByName<T, Name>['inputs']>;

/**
 * Obtain all the possible function names of an ABI.
 */
export type ExtractAbiFunctionNames<T extends ViemAbiFunction[]> =
  T[number]['name'];

/**
 * Argument type definitions for each EVM precompile function.
 */
export type AbiFunctionArgs = {
  [Precompile.STAKING]: {
    bond: [BN, Address];
    bondExtra: [BN];
    chill: [];
    currentEra: [];
    erasTotalStake: [BN];
    isNominator: [Address];
    isValidator: [Address];
    maxNominatorCount: [];
    maxValidatorCount: [];
    minActiveStake: [];
    minNominatorBond: [];
    minValidatorBond: [];
    nominate: [Address[]];
    payoutStakers: [Address, number];
    rebond: [BN];
    setController: [];
    setPayee: [number];
    unbond: [BN];
    validatorCount: [];
    withdrawUnbonded: [number];
  };

  [Precompile.VESTING]: {
    vest: [];
  };

  [Precompile.BATCH]: {
    batchAll: [Address[], BN[], string[], BN[]];
    batchSome: [Address[], BN[], string[], BN[]];
    batchSomeUntilFailure: [Address[], BN[], string[], BN[]];
  };

  [Precompile.BALANCES_ERC20]: {
    transfer: [Address, BN];
  };

  [Precompile.LST]: {
    join: [BN, BN];
    bondExtra: [BN, number, BN];
    unbond: [SubstrateBytes32Address, BN, BN];
    poolWithdrawUnbonded: [BN, number];
    withdrawUnbonded: [SubstrateBytes32Address, BN, number];
    create: [
      BN,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
      string,
      string,
    ];
    nominate: [BN, SubstrateBytes32Address[]];
    setState: [BN, number];
    setMetadata: [BN, string];
    setConfigs: [BN, BN, number, number];
    updateRoles: [
      BN,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
    ];
  };
};

// See https://github.com/webb-tools/tangle/tree/main/precompiles for more details.
export enum PrecompileAddress {
  STAKING = '0x0000000000000000000000000000000000000800',
  VESTING = '0x0000000000000000000000000000000000000801',
  BATCH = '0x0000000000000000000000000000000000000808',
  BALANCES_ERC20 = '0x0000000000000000000000000000000000000802',
  LST = '0x0000000000000000000000000000000000000824',
  RESTAKING = '0x',
}

export const getPrecompileAddress = (
  precompile: Precompile,
): PrecompileAddress => {
  switch (precompile) {
    case Precompile.STAKING:
      return PrecompileAddress.STAKING;
    case Precompile.VESTING:
      return PrecompileAddress.VESTING;
    case Precompile.BATCH:
      return PrecompileAddress.BATCH;
    case Precompile.BALANCES_ERC20:
      return PrecompileAddress.BALANCES_ERC20;
    case Precompile.LST:
      return PrecompileAddress.LST;
    case Precompile.RESTAKING:
      return PrecompileAddress.RESTAKING;
  }
};

export const getPrecompileAbi = (precompile: Precompile): AbiFunction[] => {
  switch (precompile) {
    case Precompile.STAKING:
      return STAKING_PRECOMPILE_ABI;
    case Precompile.VESTING:
      return VESTING_PRECOMPILE_ABI;
    case Precompile.BATCH:
      return BATCH_PRECOMPILE_ABI;
    case Precompile.BALANCES_ERC20:
      return BALANCES_ERC20_PRECOMPILE_ABI;
    case Precompile.LST:
      return LST_PRECOMPILE_ABI;
    case Precompile.RESTAKING:
      return RESTAKING_PRECOMPILE_ABI;
  }
};
