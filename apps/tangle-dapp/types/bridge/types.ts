import { AddressType } from '@webb-tools/dapp-config/types';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@webb-tools/evm-contract-metadata';

export interface BridgeTokenType {
  tokenSymbol: string;
  tokenType: EVMTokenEnum;
  bridgeType: EVMTokenBridgeEnum;
  address: AddressType;
  abi: any;
  decimals: number;
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
