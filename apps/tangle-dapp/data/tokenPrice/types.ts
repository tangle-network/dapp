export interface TokenPriceFetcher<TIsBatchSupported extends boolean> {
  endpoint: string;

  isBatchSupported: TIsBatchSupported;

  fetchTokenPrice(
    token: TIsBatchSupported extends true ? string[] : string,
  ): Promise<TIsBatchSupported extends true ? number[] : number>;
}
