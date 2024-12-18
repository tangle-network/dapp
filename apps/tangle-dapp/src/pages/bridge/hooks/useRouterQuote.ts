import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { ROUTER_PARTNER_ID, ROUTER_QUOTE_URL } from '../constants';

export type RouterQuoteProps = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amountInWei: string;
  fromTokenChainId: string;
  toTokenChainId: string;
};

export const getRouterQuote = async (props: RouterQuoteProps | null) => {
  try {
    if (!props) {
      throw new Error('Router quote props are required');
    }

    const {
      fromTokenAddress,
      toTokenAddress,
      amountInWei,
      fromTokenChainId,
      toTokenChainId,
    } = props;

    const res = await axios.get(ROUTER_QUOTE_URL, {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: amountInWei,
        fromTokenChainId,
        toTokenChainId,
        partnerId: ROUTER_PARTNER_ID,
      },
    });
    return res.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response) {
      console.error('Router quote error:', e.response.data);
      throw e.response.data;
    }
    console.error('Error fetching router quote:', e);
    throw e;
  }
};

export const useRouterQuote = (props: RouterQuoteProps | null) => {
  return useQuery({
    queryKey: ['routerQuote', props],
    queryFn: () => getRouterQuote(props),
    enabled: false,
    refetchOnWindowFocus: false,
  });
};
