import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import useEthersSigner from './useEthersSigner';
import { isEvmAddress } from '@tangle-network/ui-components';
import { ROUTER_TRANSACTION_URL } from '@tangle-network/tangle-shared-ui/constants/bridge';

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
  // TODO: Avoid using `any` here.
  routerQuoteData: any;
  fromTokenAddress: string;
  toTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  refundAddress: string;
  ethersSigner: JsonRpcSigner | null;
};

export const transferByRouter = async (
  props: RouterTransferProps,
): Promise<TransactionReceipt | null> => {
  try {
    if (!props || !props.ethersSigner) {
      throw new Error('Invalid props or ethers signer');
    }

    const {
      routerQuoteData,
      fromTokenAddress,
      toTokenAddress,
      senderAddress,
      receiverAddress,
      refundAddress,
      ethersSigner,
    } = props;

    const { data: transactionData } =
      await axios.post<RouterTransactionResponse>(ROUTER_TRANSACTION_URL, {
        ...routerQuoteData,
        fromTokenAddress,
        toTokenAddress,
        senderAddress,
        receiverAddress,
        refundAddress,
      });

    console.log('Transaction data received:', transactionData);

    const toAddress = transactionData.allowanceTo;

    if (!toAddress || !isEvmAddress(toAddress)) {
      console.error('Invalid "to" address:', toAddress);
      throw new Error(`Invalid "to" address: ${toAddress}`);
    }

    const transaction = await ethersSigner.sendTransaction(transactionData.txn);
    const receipt = await transaction.wait();

    console.log('Transaction receipt:', receipt);
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
