import { IMailbox__factory } from '@hyperlane-xyz/core';
import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { BridgeTokenType } from '../../types/bridge';
import { getHyperlaneWarpContext, getHyperlaneWarpCore } from './context';
import { tryFindToken } from './utils';

export async function hyperlaneTransfer(params?: {
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  senderAddress: string;
  recipientAddress: string;
  token: BridgeTokenType;
  amount: string;
  ethersProvider: any;
}) {
  if (!params) return null;

  const warpContext = await getHyperlaneWarpContext();

  const warpCore = getHyperlaneWarpCore();
  if (!warpCore) throw new Error('Hyperlane Warp Core not initialized');

  const {
    sourceTypedChainId,
    destinationTypedChainId,
    senderAddress,
    recipientAddress,
    token,
    amount,
    ethersProvider,
  } = params;

  const routeAddress =
    token.hyperlaneRouteContractAddress?.[sourceTypedChainId];
  if (!routeAddress) throw new Error('Token address not found');

  const hyperlaneToken = tryFindToken(
    getHyperlaneChainName(sourceTypedChainId),
    routeAddress,
  );
  if (!hyperlaneToken) throw new Error('Token not found');

  const originTokenAmount = hyperlaneToken.amount(amount);
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
    console.debug('Error validating transfer', JSON.stringify(errors));
    throw new Error('Error validating transfer');
  }

  const txs = await warpCore.getTransferRemoteTxs({
    originTokenAmount,
    destination,
    sender: senderAddress,
    recipient: recipientAddress,
  });

  const fees = await warpCore.estimateTransferRemoteFees({
    originToken: hyperlaneToken,
    destination,
    sender: senderAddress,
  });

  // const messageId =
  //   '0x67f7e2e4763a0af7392609d8d98036c8bd49ccaf4226271f57f6f3ef1162c954';
  // const destinationChainId = 3799;
  // const tangleTestnetMailboxAddress =
  //   '0x0FDc2400B5a50637880dbEfB25d631c957620De8';

  // console.debug('messageId', messageId);
  // console.debug('destinationChainId', destinationChainId);
  // console.debug('tangleTestnetMailboxAddress', tangleTestnetMailboxAddress);

  // const provider = warpContext?.multiProvider.getProvider(destinationChainId);
  // const mailbox = IMailbox__factory.connect(
  //   tangleTestnetMailboxAddress,
  //   ethersProvider,
  // );

  // console.debug(`Querying mailbox about message ${messageId}`);
  // const isDelivered = await mailbox.delivered(messageId);
  // console.debug(`Mailbox delivery status for ${messageId}: ${isDelivered}`);

  return {
    txs,
    fees: {
      local: {
        amount: fees.localQuote.amount,
        symbol: fees.localQuote.token.symbol,
      },
      interchain: {
        amount: fees.interchainQuote.amount,
        symbol: fees.interchainQuote.token.symbol,
      },
    },
  };
}

function getHyperlaneChainName(typedChainId: number) {
  switch (typedChainId) {
    case PresetTypedChainId.TangleTestnetEVM:
      return 'tangletestnet';
    case PresetTypedChainId.Holesky:
      return 'holesky';
    default:
      throw new Error('Unknown chain');
  }
}
