export enum Currency {
  USD,
  EUR,
}

const useTokenPrice = (
  _tokenSymbol: string,
  _currency: Currency = Currency.USD,
) => {
  const price: number | Error | null = 123_456;

  // TODO: Awaiting implementation. Meanwhile, this hook is used as a placeholder. The idea is that by once we implement this hook, it should automatically reflect the token price in the consumers of this hook, instead of having to manually integrate it into the codebase.

  return price;
};

export default useTokenPrice;
