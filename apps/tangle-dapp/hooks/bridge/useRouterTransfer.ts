import { JsonRpcSigner } from '@ethersproject/providers';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { ROUTER_TRANSACTION_URL } from '../../constants/bridge/constants';
import useEthersSigner from './useEtheresSigner';

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
}: RouterTransferProps) => {
  if (!ethersSigner) {
    throw new Error('Ethers signer is not available');
  }

  try {
    const transactionData = await axios.post(ROUTER_TRANSACTION_URL, {
      ...routerQuoteData,
      fromTokenAddress,
      toTokenAddress,
      senderAddress,
      receiverAddress,
      refundAddress,
    });

    console.log('📦 Transaction data received:', transactionData.data);

    // Use allowanceTo directly from the response
    const toAddress = transactionData.data.allowanceTo;

    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      console.error('❌ Invalid "to" address:', toAddress);
      throw new Error(`Invalid "to" address: ${toAddress}`);
    }

    const transaction = await ethersSigner.sendTransaction(
      transactionData.data.txn,
    );

    console.log('Transaction sent:', transaction);

    const receipt = await transaction.wait();

    console.log('Transaction receipt:', receipt);

    return receipt;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response) {
      console.error('Router transfer error:', e.response.data);
      throw e.response.data;
    }
    console.error('Error making router transfer:', e);
    throw e;
  }
};

export const useRouterTransfer = (
  props: Omit<RouterTransferProps, 'ethersSigner'>,
) => {
  const ethersSigner = useEthersSigner();

  return useMutation({
    mutationKey: ['routerTransfer'],
    mutationFn: () => transferByRouter({ ...props, ethersSigner }),
  });
};
