import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getHyperlaneWarpCore } from '../lib/hyperlane/context';
import { BridgeTokenType } from '@webb-tools/tangle-shared-ui/types';
import { getHyperlaneChainName, tryFindToken } from '../lib/hyperlane/utils';

export type HyperlaneQuoteProps = {
  token: BridgeTokenType;
  amount: number;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  senderAddress: string;
  recipientAddress: string;
};

export const getHyperlaneQuote = async (props: HyperlaneQuoteProps | null) => {
  try {
    if (!props) {
      throw new Error('Hyperlane quote props are required');
    }

    const {
      token,
      amount,
      sourceTypedChainId,
      destinationTypedChainId,
      senderAddress,
      recipientAddress,
    } = props;

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
      throw new Error('Invalid transfer parameters');
    }

    const fees = await warpCore.estimateTransferRemoteFees({
      originToken: hyperlaneToken,
      destination,
      sender: senderAddress,
    });

    return {
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
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response) {
      console.error('Hyperlane quote error:', e.response.data);
      throw e.response.data;
    }
    console.error('Error fetching hyperlane quote:', e);
    throw e;
  }
};

export const useHyperlaneQuote = (props: HyperlaneQuoteProps | null) => {
  return useQuery({
    queryKey: ['hyperlaneQuote', props],
    queryFn: () => getHyperlaneQuote(props),
    enabled: false,
    refetchOnWindowFocus: false,
  });
};
