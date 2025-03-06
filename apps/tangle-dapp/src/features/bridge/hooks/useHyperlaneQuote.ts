import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getHyperlaneWarpCore } from '../context/BridgeHyperlaneContext/BridgeHyperlaneContext';
import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import getHyperlaneChainName from '../utils/getHyperlaneChainName';
import getHyperlaneToken from '../utils/getHyperlaneToken';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { fetchEvmTokenBalance } from './useEvmBalances';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { notificationApi } from '@tangle-network/ui-components';

export type HyperlaneQuoteProps = {
  token: BridgeToken;
  amount: number;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  senderAddress: string;
  recipientAddress: string;
};

export type HyperlaneQuote = {
  fees: {
    local: {
      amount: bigint;
      symbol: string;
    };
    interchain: {
      amount: bigint;
      symbol: string;
    };
  };
};

export const getHyperlaneQuote = async (
  props: HyperlaneQuoteProps | null,
): Promise<HyperlaneQuote | null> => {
  try {
    if (!props) {
      console.error('Hyperlane quote props are required');
      return null;
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
      console.error('Hyperlane warp core not found');
      return null;
    }

    const tokenToBridge =
      sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
        ? token.hyperlaneSyntheticAddress
        : token.address;

    const hyperlaneToken = getHyperlaneToken(
      getHyperlaneChainName(sourceTypedChainId),
      tokenToBridge,
    );

    if (!hyperlaneToken) {
      console.error('Hyperlane token not found');
      return null;
    }

    const originTokenAmount = hyperlaneToken.amount(amount);
    const destination = getHyperlaneChainName(destinationTypedChainId);

    const isCollateralSufficient =
      await warpCore.isDestinationCollateralSufficient({
        originTokenAmount,
        destination,
      });

    if (!isCollateralSufficient) {
      const balance = await fetchEvmTokenBalance(
        senderAddress,
        destinationTypedChainId,
        token.address as EvmAddress,
        token.abi,
        token.decimals,
      );

      notificationApi({
        variant: 'error',
        message: `Insufficient collateral on ${destination} chain. \n Available collateral: ${parseFloat(balance.toString()).toFixed(6)} ${token.symbol}`,
      });

      console.error('Insufficient destination collateral');
      return null;
    }

    const errors = await warpCore.validateTransfer({
      originTokenAmount,
      destination,
      recipient: recipientAddress,
      sender: senderAddress,
    });

    if (errors) {
      console.error('Invalid transfer parameters');
      return null;
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
      return null;
    }
    console.error('Error fetching hyperlane quote:', e);
    return null;
  }
};

export const useHyperlaneQuote = (props: HyperlaneQuoteProps | null) => {
  return useQuery({
    queryKey: ['hyperlaneQuote', props],
    queryFn: () => getHyperlaneQuote(props),
    enabled: false,
    refetchOnWindowFocus: false,
    initialData: null,
  });
};
