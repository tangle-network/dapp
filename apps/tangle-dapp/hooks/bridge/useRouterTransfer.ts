import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { ROUTER_TRANSACTION_URL } from '../../constants/bridge/constants';
import useEthersSigner from './useEtheresSigner';

interface RouterTransactionResponse {
  allowanceTo: string;
  txn: {
    to: string;
    data: string;
    value: string;
    from: string;
    gasPrice?: string;
    gasLimit?: string;
  };
}

export type RouterTransferProps = {
  routerQuoteData: any;
  fromTokenAddress: string;
  toTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  refundAddress: string;
  ethersSigner: JsonRpcSigner | null;
};

export const transferByRouter = async ({
  routerQuoteData,
  fromTokenAddress,
  toTokenAddress,
  senderAddress,
  receiverAddress,
  refundAddress,
  ethersSigner,
}: RouterTransferProps): Promise<TransactionReceipt | null> => {
  if (!ethersSigner) {
    return null;
  }

  try {
    const { data: transactionData } =
      await axios.post<RouterTransactionResponse>(ROUTER_TRANSACTION_URL, {
        ...routerQuoteData,
        fromTokenAddress,
        toTokenAddress,
        senderAddress,
        receiverAddress,
        refundAddress,
      });

    console.log('📦 Transaction data received:', transactionData);

    const toAddress = transactionData.allowanceTo;

    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      console.error('❌ Invalid "to" address:', toAddress);
      throw new Error(`Invalid "to" address: ${toAddress}`);
    }

    const transaction = await ethersSigner.sendTransaction(transactionData.txn);
    const receipt = await transaction.wait();

    console.log('✅ Transaction receipt:', receipt);
    return receipt;
  } catch (e: unknown) {
    console.error('Error making router transfer:', e);
    return null;
  }
};

export const useRouterTransfer = (
  props: Omit<RouterTransferProps, 'ethersSigner'>,
) => {
  const ethersSigner = useEthersSigner();

  return useMutation<TransactionReceipt | null>({
    mutationKey: ['routerTransfer'],
    mutationFn: async () => {
      if (!ethersSigner) {
        return null;
      }
      return transferByRouter({ ...props, ethersSigner });
    },
  });
};
