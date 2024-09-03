import axios from 'axios';
import z from 'zod';

import ensureError from '../../../utils/ensureError';
import type { TokenPriceFetcher } from '../types';

export const coincapTokenPriceFetcher = {
  endpoint: 'https://api.coincap.io/v2/assets',

  isBatchSupported: false,

  async fetchTokenPrice(token: string): Promise<number | Error> {
    try {
      const response = await axios.get(this.endpoint, {
        params: {
          search: token,
        },
      });

      const Schema = z.object({
        data: z.array(
          z.object({
            priceUsd: z.string(),
          }),
        ),
      });

      const result = Schema.safeParse(response.data);
      if (result.success === false)
        throw new Error('Invalid response from coincap');

      if (result.data.data.length === 0)
        throw new Error('Token not found on coincap');

      return Number(result.data.data[0].priceUsd);
    } catch (error) {
      return ensureError(error);
    }
  },
} as const satisfies TokenPriceFetcher<false>;
