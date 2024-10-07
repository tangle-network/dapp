import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { BridgeTokenType } from '../../types/bridge';
import { getHyperlaneWarpCore } from './context';
import { tryFindToken } from './utils';

export async function hyperlaneTransfer(params?: {
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  senderAddress: string;
  recipientAddress: string;
  token: BridgeTokenType;
  amount: string;
}) {
  if (!params) return null;

  const warpCore = getHyperlaneWarpCore();
  if (!warpCore) throw new Error('Hyperlane Warp Core not initialized');

  const {
    sourceTypedChainId,
    destinationTypedChainId,
    senderAddress,
    recipientAddress,
    token,
    amount,
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
