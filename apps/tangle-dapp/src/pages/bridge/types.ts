import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@webb-tools/evm-contract-metadata';
import { Abi } from 'viem';

export interface BridgeTokenType {
  tokenSymbol: string;
  tokenType: EVMTokenEnum;
  bridgeType: EVMTokenBridgeEnum;
  address: `0x${string}`;
  abi: Abi;
  decimals: number;
  chainId: PresetTypedChainId;
  hyperlaneRouteContractAddress?: `0x${string}`;
}

export type BridgeChainsConfigType = Record<
  PresetTypedChainId,
  Record<
    PresetTypedChainId,
    {
      supportedTokens: BridgeTokenType[];
    }
  >
>;
