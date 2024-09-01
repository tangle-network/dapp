import axios from 'axios';
import z from 'zod';

import type { TokenPriceFetcher } from '../types';

export const coinbaseTokenPriceFetcher = {
  endpoint: 'https://api.coinbase.com/v2/exchange-rates',

  isBatchSupported: false,

  async fetchTokenPrice(token: string): Promise<number> {
    const response = await axios.get(this.endpoint, {
      params: {
        currency: token,
      },
    });

    const Schema = z.object({
      data: z.object({
        rates: z.object({
          USD: z.string(),
        }),
      }),
    });

    const result = Schema.safeParse(response.data);
    if (result.success === false)
      throw new Error('Invalid response from coinbase');

    return Number(result.data.data.rates.USD);
  },
} as const satisfies TokenPriceFetcher<false>;
