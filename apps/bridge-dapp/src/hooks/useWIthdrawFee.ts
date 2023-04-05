import {
  ActiveWebbRelayer,
  RelayerFeeInfo,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { getLatestAnchorAddress } from '@webb-tools/dapp-config';
import { PresetTypedChainId, zeroAddress } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import { useCurrencies, useVAnchor } from '@webb-tools/react-hooks';
import { calculateTypedChainId, CircomUtxo, Note } from '@webb-tools/sdk-core';
import {
  Web3Provider,
  Web3VAnchorActions,
} from '@webb-tools/web3-api-provider';
import { BigNumber, ethers, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

type UseWithdrawFeeReturnType = {
  feeInfo: RelayerFeeInfo | BigNumber | null;
  fetchRelayerFeeInfo: () => Promise<void>;
  isLoading: boolean;
  error: unknown | null;
};

const hasGetGasAmountMethod = (
  vanchorApi: any | undefined
): vanchorApi is Web3VAnchorActions => {
  return !!vanchorApi && typeof vanchorApi['getGasAmount'] === 'function';
};

// The gas amount config for each chain
const gasAmountConfig: Record<number, BigNumber> = {
  [PresetTypedChainId.OptimismTestnet]: BigNumber.from(1800000),
  [PresetTypedChainId.PolygonTestnet]: BigNumber.from(1800000),
  [PresetTypedChainId.ArbitrumTestnet]: BigNumber.from(6000000),
  [PresetTypedChainId.Sepolia]: BigNumber.from(1800000),
  [PresetTypedChainId.MoonbaseAlpha]: BigNumber.from(1900000),
  [PresetTypedChainId.Goerli]: BigNumber.from(1900000),
};

export const useWithdrawFee = (
  withdrawNotes: Note[] | null,
  amount: number,
  recipient: string,
  relayer: ActiveWebbRelayer | null,
  wrapUnwrapToken = ''
): UseWithdrawFeeReturnType => {
  const { activeApi, activeChain, noteManager } = useWebContext();

  const { fungibleCurrency } = useCurrencies();

  const { api: vanchorApi } = useVAnchor();

  const [feeInfo, setFeeInfo] = useState<RelayerFeeInfo | BigNumber | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<unknown | null>(null);

  const fetchRelayerFeeInfo = useCallback(async () => {
    try {
      if (!activeChain || !noteManager || !fungibleCurrency || !vanchorApi) {
        throw new Error('Missing required params');
      }

      // All the inputs is required to call get fee info
      if (!withdrawNotes?.length || !amount || !recipient || !relayer) {
        throw new Error('All the inputs is required to call get fee info');
      }

      setError(null);
      setIsLoading(true);

      const currentTypedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      const fungibleDecimals = fungibleCurrency.getDecimals();

      // Get the notes that will be spent for this withdraw
      const inputNotes = NoteManager.getNotesFifo(
        withdrawNotes ?? [],
        utils.parseUnits(amount.toString(), fungibleDecimals)
      );
      if (!inputNotes) {
        throw new Error('Not enough notes to withdraw');
      }

      // Get the cumulative value of the notes to be spent
      const sumInputNotes = inputNotes.reduce<BigNumber>(
        (currentValue, note) => {
          return currentValue.add(BigNumber.from(note.note.amount));
        },
        BigNumber.from(0)
      );

      const changeAmountBigNumber = sumInputNotes.sub(
        utils.parseUnits(amount.toString(), fungibleDecimals)
      );

      // Generate change utxo (or dummy utxo if the changeAmount is `0`)
      const changeUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: changeAmountBigNumber.toString(),
        chainId: currentTypedChainId.toString(),
        keypair: noteManager.getKeypair(),
        originChainId: currentTypedChainId.toString(),
      });

      if (!hasGetGasAmountMethod(vanchorApi)) {
        console.error('not found gasGasAmount method in current vanchor');
        return;
      }

      const { inputUtxos, leavesMap } = await vanchorApi.commitmentsSetup(
        inputNotes
      );

      const vanchorAddr = getLatestAnchorAddress(currentTypedChainId);
      if (!vanchorAddr) {
        console.error('No anchor address in current active chain');
        return;
      }

      const gasAmount = await vanchorApi.getGasAmount(vanchorAddr, {
        inputs: inputUtxos,
        outputs: [changeUtxo],
        fee: BigNumber.from(0),
        refund: BigNumber.from(0),
        recipient: recipient,
        relayer: relayer?.beneficiary ?? zeroAddress,
        wrapUnwrapToken,
        leavesMap,
      });

      console.log('gasAmount', gasAmount.toNumber());

      const feeInfo = await relayer.getFeeInfo(
        currentTypedChainId,
        vanchorAddr,
        gasAmount
      );
      setFeeInfo(feeInfo);
    } catch (error) {
      setError(error);
      setFeeInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeChain,
    amount,
    fungibleCurrency,
    noteManager,
    recipient,
    relayer,
    vanchorApi,
    withdrawNotes,
    wrapUnwrapToken,
  ]);

  const fetchFeeInfo = useCallback(async () => {
    try {
      setIsLoading(true);

      if (
        !withdrawNotes?.length ||
        !amount ||
        !recipient ||
        relayer ||
        !activeChain ||
        !activeApi
      ) {
        return;
      }

      const currentTypedChain = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      if (!gasAmountConfig[currentTypedChain]) {
        throw new Error(
          `No gas amount config for current chain: ${currentTypedChain}`
        );
      }

      const provider = activeApi.getProvider();
      if (!(provider instanceof Web3Provider)) {
        throw new Error('Provider is not a Web3Provider');
      }

      const gasAmount = gasAmountConfig[currentTypedChain];
      const etherProvider = provider.intoEthersProvider();

      // Get the greatest gas price
      let gasPrice = await etherProvider.getGasPrice();
      const feeData = await etherProvider.getFeeData();
      if (feeData.maxFeePerGas && feeData.maxFeePerGas.gt(gasPrice)) {
        gasPrice = feeData.maxFeePerGas;
      }

      if (
        feeData.maxPriorityFeePerGas &&
        feeData.maxPriorityFeePerGas.gt(gasPrice)
      ) {
        gasPrice = feeData.maxPriorityFeePerGas;
      }

      setFeeInfo(gasAmount.mul(gasPrice));
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeApi,
    activeChain,
    amount,
    recipient,
    relayer,
    withdrawNotes?.length,
  ]);

  useEffect(() => {
    setFeeInfo(null);
    setError(null);
    setIsLoading(false);
  }, [withdrawNotes, relayer, wrapUnwrapToken]);

  useEffect(() => {
    if (relayer) {
      setFeeInfo(null);
    } else {
      fetchFeeInfo();
    }
  }, [fetchFeeInfo, relayer]);

  return {
    feeInfo,
    fetchRelayerFeeInfo,
    isLoading: isLoading,
    error: error,
  };
};
