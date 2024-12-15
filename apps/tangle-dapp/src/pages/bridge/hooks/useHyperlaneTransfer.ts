import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { useMutation } from '@tanstack/react-query';
import { utils } from 'ethers';

import useEthersSigner from './useEtheresSigner';
import { BridgeTokenType } from '@webb-tools/tangle-shared-ui/types';
import { getHyperlaneChainName } from '../lib/hyperlane/utils';
import { getHyperlaneWarpCore } from '../lib/hyperlane/context';
import { tryFindToken } from '../lib/hyperlane/utils';
import { providers } from 'ethers';

export type HyperlaneTransferProps = {
  token: BridgeTokenType;
  amount: number;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  senderAddress: string;
  recipientAddress: string;
  ethersSigner: JsonRpcSigner | null;
};

export const transferByHyperlane = async ({
  token,
  amount,
  sourceTypedChainId,
  destinationTypedChainId,
  senderAddress,
  recipientAddress,
  ethersSigner,
}: HyperlaneTransferProps): Promise<TransactionReceipt[] | null> => {
  if (!ethersSigner) {
    return null;
  }

  try {
    const warpCore = getHyperlaneWarpCore();
    if (!warpCore) {
      throw new Error('Hyperlane warp core not found');
    }

    const hyperlaneToken = tryFindToken(
      getHyperlaneChainName(sourceTypedChainId),
      token.hyperlaneRouteContractAddress,
    );
    if (!hyperlaneToken) {
      throw new Error('Hyperlane token not found');
    }

    const parsedAmount = utils
      .parseUnits(amount.toString(), token.decimals)
      .toString();

    const originTokenAmount = hyperlaneToken.amount(parsedAmount);
    const destination = getHyperlaneChainName(destinationTypedChainId);

    const isCollateralSufficient =
      await warpCore.isDestinationCollateralSufficient({
        originTokenAmount,
        destination,
      });
    if (!isCollateralSufficient) {
      throw new Error('Insufficient destination collateral');
    }

    const errors = await warpCore.validateTransfer({
      originTokenAmount,
      destination,
      recipient: recipientAddress,
      sender: senderAddress,
    });

    if (errors) {
      throw new Error('Invalid transfer parameters');
    }

    const txs = await warpCore.getTransferRemoteTxs({
      originTokenAmount,
      destination,
      sender: senderAddress,
      recipient: recipientAddress,
    });

    const receipts: TransactionReceipt[] = [];

    for (const tx of txs) {
      const transaction = await ethersSigner.sendTransaction(
        tx.transaction as providers.TransactionRequest,
      );
      const receipt = await transaction.wait();
      console.log('✅ Transaction receipt:', receipt);
      receipts.push(receipt);
    }

    return receipts;
  } catch (e: unknown) {
    console.error('Error making hyperlane transfer:', e);
    return null;
  }
};

export const useHyperlaneTransfer = (
  props: Omit<HyperlaneTransferProps, 'ethersSigner'>,
) => {
  const ethersSigner = useEthersSigner();

  return useMutation<TransactionReceipt[] | null>({
    mutationKey: ['hyperlaneTransfer'],
    mutationFn: async () => {
      if (!ethersSigner) {
        return null;
      }
      return transferByHyperlane({ ...props, ethersSigner });
    },
  });
};
