import ensureError from './ensureError';
import axios from 'axios';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CURRENCY = 'usd';

export enum CoinGeckoTokenId {
  ETH = 'ethereum',
  BTC = 'bitcoin',
  USDT = 'tether',
}

const SYMBOL_MAP: Record<string, CoinGeckoTokenId> = {
  // TODO: Add a list of token symbols which will be available on testnet/mainnet
  eth: CoinGeckoTokenId.ETH,
};

export const fetchTokenPrice = async (
  tokenId: CoinGeckoTokenId,
): Promise<number | Error> => {
  try {
    const endpointUrl = new URL(COINGECKO_API_BASE_URL);

    endpointUrl.searchParams.append('ids', tokenId);
    endpointUrl.searchParams.append('vs_currencies', CURRENCY);

    const response = await axios.get<
      Record<CoinGeckoTokenId, { [CURRENCY]: number }>
    >(endpointUrl.toString());

    const prices = response.data[tokenId];

    if (prices === undefined) {
      return new Error(`Token "${tokenId}" not found in the response`);
    } else if (!(CURRENCY in prices)) {
      return new Error(`Currency "${CURRENCY}" not found in the response`);
    }

    return prices[CURRENCY];
  } catch (possibleError) {
    return ensureError(possibleError);
  }
};

export const fetchTokenPriceBySymbol = async (
  tokenSymbol: string,
): Promise<number | Error> => {
  const coingeckoTokenId = SYMBOL_MAP[tokenSymbol] ?? null;

  if (coingeckoTokenId === null) {
    return new Error(`No CoinGecko token ID found for symbol: ${tokenSymbol}`);
  }

  return fetchTokenPrice(coingeckoTokenId);
};
