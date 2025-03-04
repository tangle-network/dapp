import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { EvmAddress } from '@tangle-network/ui-components/types/address';
import {
  ROUTER_PARTNER_ID,
  ROUTER_QUOTE_URL,
} from '@tangle-network/tangle-shared-ui/constants/bridge';

export type RouterQuoteParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amountInWei: string;
  fromTokenChainId: string;
  toTokenChainId: string;
};

export type RouterQuote = {
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
): Promise<RouterQuote | null> => {
  try {
    if (!params) {
      console.error('Router quote params are required');
      return null;
    }

    const {
      fromTokenAddress,
      toTokenAddress,
      amountInWei,
      fromTokenChainId,
      toTokenChainId,
    } = params;

    const response = await axios.get<RouterQuote>(ROUTER_QUOTE_URL, {
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
      return null;
    }

    console.error('Error fetching router quote:', error);
    return null;
  }
};

const useRouterQuote = (props: RouterQuoteParams | null) => {
  return useQuery<unknown, RouterQuoteError, RouterQuote | null>({
    queryKey: ['routerQuote', props],
    queryFn: () => fetchRouterQuote(props),
    enabled: false,
    refetchOnWindowFocus: false,
    initialData: null,
  });
};

export default useRouterQuote;
