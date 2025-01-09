import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { ROUTER_PARTNER_ID, ROUTER_QUOTE_URL } from '../constants';

export type RouterQuoteParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amountInWei: string;
  fromTokenChainId: string;
  toTokenChainId: string;
};

type RouterQuoteResponse = unknown;

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

    console.debug('bridge quote data', response.data);

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError<RouterQuoteError>(error) &&
      error.response !== undefined
    ) {
      console.error('Router quote error:', error.response.data);

      throw error.response.data.error;
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
