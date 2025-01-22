import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { ROUTER_PARTNER_ID, ROUTER_QUOTE_URL } from '../../constants/bridge';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';

export type RouterQuoteParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amountInWei: string;
  fromTokenChainId: string;
  toTokenChainId: string;
};

type RouterQuoteResponse = {
  chainId: string;
  chainType: string;
  priceImpact: string;
  stableReserveAmount: string;
  estimatedTime: number;
  flowType: string;
  fromTokenAddress: EvmAddress;
  allowanceTo: EvmAddress;

  bridgeFee: {
    address: EvmAddress;
    amount: string;
    decimals: number;
    symbol: string;
  };

  destination: {
    asset: {
      address: EvmAddress;
      chainId: string;
      decimals: number;
      isMintable: boolean;
      isWrappedAsset: boolean;
      name: string;
      resourceId: string;
      symbol: string;
    };
  };
};

type RouterQuoteError = {
  error: string;
  errorCode: string;
};

const fetchRouterQuote = async (
  params: RouterQuoteParams | null,
): Promise<RouterQuoteResponse> => {
  try {
    if (!params) {
      throw new Error('Router quote params are required');
    }

    const {
      fromTokenAddress,
      toTokenAddress,
      amountInWei,
      fromTokenChainId,
      toTokenChainId,
    } = params;

    const response = await axios.get<RouterQuoteResponse>(ROUTER_QUOTE_URL, {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: amountInWei,
        fromTokenChainId,
        toTokenChainId,
        partnerId: ROUTER_PARTNER_ID,
      },
    });

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError<RouterQuoteError>(error) &&
      error.response !== undefined
    ) {
      console.error('Router quote error:', error.response.data);

      throw error.response.data;
    }

    console.error('Error fetching router quote:', error);

    throw error;
  }
};

const useBridgeRouterQuote = (props: RouterQuoteParams | null) => {
  return useQuery<unknown, RouterQuoteError, RouterQuoteResponse>({
    queryKey: ['routerQuote', props],
    queryFn: () => fetchRouterQuote(props),
    enabled: false,
    refetchOnWindowFocus: false,
  });
};

export default useBridgeRouterQuote;
