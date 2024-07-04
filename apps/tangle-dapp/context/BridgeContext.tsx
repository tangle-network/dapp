'use client';

import { BN } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import assert from 'assert';
import Decimal from 'decimal.js';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { BRIDGE } from '../constants/bridge';
import { BridgeTokenId, BridgeType, BridgeWalletError } from '../types/bridge';
import { isEVMChain, isSubstrateChain } from '../utils/bridge';

const BRIDGE_SOURCE_CHAIN_OPTIONS = sortChainOptions(
  Object.keys(BRIDGE).map(
    (presetTypedChainId) => chainsConfig[+presetTypedChainId],
  ),
);

const DEFAULT_DESTINATION_CHAIN_OPTIONS = Object.keys(
  BRIDGE_SOURCE_CHAIN_OPTIONS[0],
).map((presetTypedChainId) => chainsConfig[+presetTypedChainId]);

const DEFAULT_TOKEN_OPTIONS = Object.values(Object.values(BRIDGE)[0])[0]
  .supportedTokens;

interface BridgeContextProps {
  selectedSourceChain: ChainConfig;
  setSelectedSourceChain: (chain: ChainConfig) => void;
  sourceChainOptions: ChainConfig[];

  selectedDestinationChain: ChainConfig;
  setSelectedDestinationChain: (chain: ChainConfig) => void;
  destinationChainOptions: ChainConfig[];

  destinationAddress: string;
  setDestinationAddress: (address: string) => void;

  bridgeType: BridgeType | null;

  amount: BN | null;
  setAmount: (amount: BN | null) => void;

  selectedTokenId: BridgeTokenId;
  setSelectedTokenId: (token: BridgeTokenId) => void;
  tokenIdOptions: BridgeTokenId[];

  isAmountInputError: boolean;
  setIsAmountInputError: (isAmountInputError: boolean) => void;

  isAddressInputError: boolean;
  setIsAddressInputError: (isAddressInputError: boolean) => void;

  walletError: BridgeWalletError | null;

  bridgeFee: Decimal | null;
  setBridgeFee: (bridgeFee: Decimal | null) => void;
  isBridgeFeeLoading: boolean;
  setIsBridgeFeeLoading: (isBridgeFeeLoading: boolean) => void;

  estimatedGasFee: Decimal | null;
  setEstimatedGasFee: (estimatedGasFee: Decimal | null) => void;
  isEstimatedGasFeeLoading: boolean;
  setIsEstimatedGasFeeLoading: (isEstimatedGasFeeLoading: boolean) => void;
}

const BridgeContext = createContext<BridgeContextProps>({
  selectedSourceChain: BRIDGE_SOURCE_CHAIN_OPTIONS[0],
  setSelectedSourceChain: () => {
    return;
  },
  sourceChainOptions: BRIDGE_SOURCE_CHAIN_OPTIONS,

  selectedDestinationChain: DEFAULT_DESTINATION_CHAIN_OPTIONS[0],
  setSelectedDestinationChain: () => {
    return;
  },
  destinationChainOptions: DEFAULT_DESTINATION_CHAIN_OPTIONS,

  destinationAddress: '',
  setDestinationAddress: () => {
    return;
  },

  bridgeType: null,

  amount: null,
  setAmount: () => {
    return;
  },

  selectedTokenId: DEFAULT_TOKEN_OPTIONS[0],
  setSelectedTokenId: () => {
    return;
  },
  tokenIdOptions: DEFAULT_TOKEN_OPTIONS,

  isAmountInputError: false,
  setIsAmountInputError: () => {
    return;
  },

  isAddressInputError: false,
  setIsAddressInputError: () => {
    return;
  },

  walletError: null,

  bridgeFee: null,
  setBridgeFee: () => {
    return;
  },
  isBridgeFeeLoading: false,
  setIsBridgeFeeLoading: () => {
    return;
  },

  estimatedGasFee: null,
  setEstimatedGasFee: () => {
    return;
  },
  isEstimatedGasFeeLoading: false,
  setIsEstimatedGasFeeLoading: () => {
    return;
  },
});

export const useBridge = () => {
  return useContext(BridgeContext);
};

const BridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { activeWallet } = useWebContext();

  const [bridgeFee, setBridgeFee] = useState<Decimal | null>(null);
  const [isBridgeFeeLoading, setIsBridgeFeeLoading] = useState(false);

  const [estimatedGasFee, setEstimatedGasFee] = useState<Decimal | null>(null);
  const [isEstimatedGasFeeLoading, setIsEstimatedGasFeeLoading] =
    useState(false);

  const [selectedSourceChain, setSelectedSourceChain] = useState<ChainConfig>(
    BRIDGE_SOURCE_CHAIN_OPTIONS[0],
  );

  const selectedSourceTypedChainId = useMemo(
    () =>
      calculateTypedChainId(
        selectedSourceChain.chainType,
        selectedSourceChain.id,
      ),
    [selectedSourceChain.chainType, selectedSourceChain.id],
  );

  const destinationChainOptions = useMemo(
    () =>
      sortChainOptions(
        Object.keys(BRIDGE[selectedSourceTypedChainId]).map(
          (presetTypedChainId) => chainsConfig[+presetTypedChainId],
        ),
      ),
    [selectedSourceTypedChainId],
  );

  assert(destinationChainOptions.length > 0, 'No destination chain options');

  const [selectedDestinationChain, setSelectedDestinationChain] =
    useState<ChainConfig>(destinationChainOptions[0]);

  const selectedDestinationTypedChainId = useMemo(
    () =>
      calculateTypedChainId(
        selectedDestinationChain.chainType,
        selectedDestinationChain.id,
      ),
    [selectedDestinationChain.chainType, selectedDestinationChain.id],
  );

  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState<BN | null>(null);
  const [walletError, setWalletError] = useState<BridgeWalletError | null>(
    null,
  );
  const [isAmountInputError, setIsAmountInputError] = useState(false);
  const [isAddressInputError, setIsAddressInputError] = useState(false);

  const tokenIdOptions = useMemo(
    () =>
      BRIDGE[selectedSourceTypedChainId][selectedDestinationTypedChainId]
        ?.supportedTokens ??
      Object.values(BRIDGE[selectedSourceTypedChainId])[0].supportedTokens,
    [selectedSourceTypedChainId, selectedDestinationTypedChainId],
  );

  const [selectedTokenId, setSelectedTokenId] = useState<BridgeTokenId>(
    tokenIdOptions[0],
  );

  const bridgeType = useMemo(() => {
    if (
      isEVMChain(selectedSourceChain) &&
      isEVMChain(selectedDestinationChain)
    ) {
      return BridgeType.SYGMA_EVM_TO_EVM;
    }

    // EVM to Substrate
    if (
      isEVMChain(selectedSourceChain) &&
      isSubstrateChain(selectedDestinationChain)
    ) {
      return BridgeType.SYGMA_EVM_TO_SUBSTRATE;
    }

    // Substrate to EVM
    if (
      isSubstrateChain(selectedSourceChain) &&
      isEVMChain(selectedDestinationChain)
    ) {
      return BridgeType.SYGMA_SUBSTRATE_TO_EVM;
    }

    // Substrate to Substrate
    if (
      isSubstrateChain(selectedSourceChain) &&
      isSubstrateChain(selectedDestinationChain)
    ) {
      return BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE;
    }

    return null;
  }, [selectedSourceChain, selectedDestinationChain]);

  useEffect(() => {
    // If current destination chain is not in the destination chain options,
    // set the first option as the destination chain.
    if (
      !destinationChainOptions.find(
        (chain) =>
          calculateTypedChainId(chain.chainType, chain.id) ===
          calculateTypedChainId(
            selectedDestinationChain.chainType,
            selectedDestinationChain.id,
          ),
      )
    ) {
      setSelectedDestinationChain(destinationChainOptions[0]);
    }
  }, [
    destinationChainOptions,
    selectedDestinationChain.id,
    selectedDestinationChain.chainType,
  ]);

  useEffect(() => {
    // If current token is not in the token options, set the first option as the token.
    if (!tokenIdOptions.find((tokenId) => tokenId === selectedTokenId)) {
      setSelectedTokenId(tokenIdOptions[0]);
    }
  }, [selectedTokenId, tokenIdOptions]);

  useEffect(() => {
    if (
      activeWallet?.platform === 'Substrate' &&
      isEVMChain(selectedSourceChain)
    ) {
      setWalletError(BridgeWalletError.MismatchEvm);
      return;
    }

    if (
      activeWallet?.platform === 'EVM' &&
      isSubstrateChain(selectedSourceChain)
    ) {
      setWalletError(BridgeWalletError.MismatchSubstrate);
      return;
    }

    setWalletError(null);
  }, [activeWallet?.platform, selectedSourceChain]);

  return (
    <BridgeContext.Provider
      value={{
        selectedSourceChain,
        setSelectedSourceChain,
        sourceChainOptions: BRIDGE_SOURCE_CHAIN_OPTIONS,

        selectedDestinationChain,
        setSelectedDestinationChain,
        destinationChainOptions,

        destinationAddress,
        setDestinationAddress,

        bridgeType,

        amount,
        setAmount,

        selectedTokenId,
        setSelectedTokenId,
        tokenIdOptions,

        isAmountInputError,
        setIsAmountInputError,

        isAddressInputError,
        setIsAddressInputError,

        walletError,

        bridgeFee,
        setBridgeFee,
        isBridgeFeeLoading,
        setIsBridgeFeeLoading,

        estimatedGasFee,
        setEstimatedGasFee,
        isEstimatedGasFeeLoading,
        setIsEstimatedGasFeeLoading,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default BridgeProvider;

function sortChainOptions(chainOptions: ChainConfig[]) {
  return chainOptions.sort((a, b) => a.name.localeCompare(b.name));
}
