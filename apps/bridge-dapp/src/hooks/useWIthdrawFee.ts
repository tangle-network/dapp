import {
  ActiveWebbRelayer,
  RelayerFeeInfo,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { getLatestAnchorAddress } from '@webb-tools/dapp-config';
import { zeroAddress } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import { useCurrencies, useVAnchor } from '@webb-tools/react-hooks';
import { CircomUtxo, Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import { Web3VAnchorActions } from '@webb-tools/web3-api-provider';
import { BigNumber, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

type UseWithdrawFeeReturnType = {
  feeInfo: RelayerFeeInfo | null;
  fetchFeeInfo: () => Promise<void>;
  isLoading: boolean;
  error: unknown | null;
};

const hasGetGasAmountMethod = (
  vanchorApi: any | undefined
): vanchorApi is Web3VAnchorActions => {
  return !!vanchorApi && typeof vanchorApi['getGasAmount'] === 'function';
};

export const useWithdrawFee = (
  withdrawNotes: Note[] | null,
  amount: number,
  recipient: string,
  relayer: ActiveWebbRelayer | null,
  wrapUnwrapToken = ''
): UseWithdrawFeeReturnType => {
  const { activeChain, noteManager } = useWebContext();

  const { fungibleCurrency } = useCurrencies();

  const { api: vanchorApi } = useVAnchor();

  const [feeInfo, setFeeInfo] = useState<RelayerFeeInfo | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<unknown | null>(null);

  const fetchFee = useCallback(async () => {
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
      if (!inputNotes) return;

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
        input: inputUtxos,
        output: [changeUtxo],
        fee: 0,
        refund: 0,
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

  useEffect(() => {
    setFeeInfo(null);
    setError(null);
    setIsLoading(false);
  }, [withdrawNotes, relayer, wrapUnwrapToken]);

  return {
    feeInfo,
    fetchFeeInfo: fetchFee,
    isLoading: isLoading,
    error: error,
  };
};
