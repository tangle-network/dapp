import ensureError from './ensureError';
import axios from 'axios';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CURRENCY = 'usd';

export enum CoingeckoTokenId {
  ETH = 'ethereum',
  BTC = 'bitcoin',
  USDT = 'tether',
}

const SYMBOL_MAP: Record<string, CoingeckoTokenId> = {
  // TODO: Add a list of token symbols which will be available on testnet/mainnet
  eth: CoingeckoTokenId.ETH,
};

// TODO: Properly implement this function, right now it's a bit wacky, and the logic doesn't work as expected.
export const fetchTokenPricesBySymbols = async (
  tokenSymbols: string[],
): Promise<(number | Error)[]> => {
  const coingeckoTokenIds: (CoingeckoTokenId | null)[] = tokenSymbols.map(
    (symbol) => SYMBOL_MAP[symbol] ?? null,
  );

  const errors = coingeckoTokenIds
    .map((result, index) => {
      if (result === null) {
        return new Error(
          `No Coingecko token ID found for symbol: ${tokenSymbols[index]}`,
        );
      }

      return null;
    })
    .filter((error): error is Error => error !== null);

  if (errors.length > 0) {
    return errors;
  }

  return fetchTokenPrices(
    coingeckoTokenIds.filter((id): id is CoingeckoTokenId => id !== null),
  );
};

export const fetchTokenPrices = async (
  tokenIds: CoingeckoTokenId[],
): Promise<(number | Error)[]> => {
  try {
    const endpointUrl = new URL(COINGECKO_API_BASE_URL);

    endpointUrl.searchParams.append('ids', tokenIds.join(','));
    endpointUrl.searchParams.append('vs_currencies', CURRENCY);

    const response = await axios.get<
      Record<CoingeckoTokenId, { [CURRENCY]: number }>
    >(endpointUrl.toString());

    return tokenIds.map((requestedTokenId) => {
      const prices = response.data[requestedTokenId];

      if (prices === undefined) {
        return new Error(
          `Token "${requestedTokenId}" not found in the response`,
        );
      } else if (!(CURRENCY in prices)) {
        return new Error(`Currency "${CURRENCY}" not found in the response`);
      }

      return prices[CURRENCY];
    });
  } catch (possibleError) {
    return tokenIds.map(() => ensureError(possibleError));
  }
};

export const fetchSingleTokenPriceBySymbol = async (
  tokenSymbol: string,
): Promise<number | Error> => {
  const [result] = await fetchTokenPricesBySymbols([tokenSymbol]);

  return result;
};
