import AcaIcon from '../assets/coins-icon/ACA.svg';
import AUSDIcon from '../assets/coins-icon/aUSD.svg';
import BtcIcon from '../assets/coins-icon/BTC.svg';
import DotIcon from '../assets/coins-icon/DOT.svg';
import LDotIcon from '../assets/coins-icon/LDOT.svg';
import RenIcon from '../assets/coins-icon/REN.svg';
import { ApiRx } from '@polkadot/api';
import { CurrencyId } from '@acala-network/types/interfaces';
import { Token, TokenPair, currencyId2Token } from '@acala-network/sdk-core';

export const TOKEN_IMAGES: Map<string, string> = new Map([
  ['ACA', AcaIcon],
  ['AUSD', AUSDIcon],
  ['BTC', BtcIcon],
  ['DOT', DotIcon],
  ['LDOT', LDotIcon],
  ['RENBTC', RenIcon],
  ['XBTC', BtcIcon]
]);

export const TOKEN_FULLNAMES: Map<string, string> = new Map([
  ['ACA', 'Acala'],
  ['AUSD', 'Acala Dollar'],
  ['BTC', 'Bitcoin'],
  ['DOT', 'Polkadot'],
  ['LDOT', 'Liquid DOT'],
  ['RENBTC', 'Ren Bitcoin'],
  ['XBTC', 'Interchain Bitcoin']
]);

export const TOKEN_COLOR: Map<string, string> = new Map([
  ['SYSTEM', '#173DC9'],
  ['ACA', '#173dc9'],
  ['BTC', '#F7931A'],
  ['XBTC', '#F7931A'],
  ['renBTC', '#87888C'],
  ['LDOT', '#00F893'],
  ['DOT', '#e6007a'],
  ['ACA-aUSD', '#173dc9'],
  ['aUSD-DOT', '#e6007a'],
  ['aUSD-BTC', '#F7931A'],
  ['aUSD-XBTC', '#F7931A'],
  ['aUSD-renBTC', '#87888C'],
  ['aUSD-LDOT', '#00F893'],
  ['aUSD-DOT', '#e6007a']
]);

export const TOKEN_NAME: Map<string, string> = new Map([
  ['AUSD', 'aUSD'],
  ['ACA', 'ACA'],
  ['BTC', 'BTC'],
  ['XBTC', 'XBTC'],
  ['RENBTC', 'renBTC'],
  ['LDOT', 'LDOT'],
  ['DOT', 'DOT']
]);

export const TOKEN_WEIGHT: Map<string, number> = new Map([
  ['AUSD', 0],
  ['ACA', 1],
  ['BTC', 2],
  ['XBTC', 2],
  ['RENBTC', 2],
  ['RENBTC', 2],
  ['DOT', 2],
  ['LDOT', 2]
]);

export function getTokenColor (token: string): string {
  return TOKEN_COLOR.get(token) || '#000000';
}

export function getTokenImage (token: string): string {
  return TOKEN_IMAGES.get(token) || '';
}

export function getTokenFullName (token: string): string {
  return TOKEN_FULLNAMES.get(token) || '';
}

export function getTokenName (token: string | string[] | CurrencyId): string {
  if (Array.isArray(token)) {
    return `${getTokenName(token[0])}-${getTokenName(token[1])}`;
  }

  if (typeof token === 'string') {
    return TOKEN_NAME.get(token) || '';
  }

  token = token as any as CurrencyId;

  if (token.isToken) {
    return getTokenName(token.asToken.toString());
  }

  if (token.isDexShare) {
    return `${getTokenName(token.asDexShare[0].toString())}-${getTokenName(token.asDexShare[1].toString())}`;
  }

  return '';
}

export function getCurrenciesFromDexShare (api: ApiRx, dexShare: CurrencyId): [CurrencyId, CurrencyId] {
  if (!dexShare.isDexShare) {
    return [dexShare, dexShare];
  }

  return [
    api.createType('CurrencyId' as any, { token: dexShare.asDexShare[0].toString() }),
    api.createType('CurrencyId' as any, { token: dexShare.asDexShare[1].toString() })
  ];
}

export function getCurrencyIdFromName (api: ApiRx, name: string | string[]): CurrencyId {
  if (Array.isArray(name)) return api.createType('CurrencyId' as any, { DEXShare: name });

  return api.createType('CurrencyId' as any, { token: name });
}

export function getCurrencyIdFromToken (api: ApiRx, token: Token | Token[]): CurrencyId {
  if (Array.isArray(token)) return api.createType('CurrencyId' as any, { DEXShare: [token[0].toChainData(), token[1].toChainData()] });

  return api.createType('CurrencyId' as any, token.toChainData());
}

export function getDexShareFromCurrencyId (api: ApiRx, token1: CurrencyId, token2: CurrencyId): CurrencyId {
  if (!(token1.isToken && token2.isToken)) {
    throw new Error('token1 and token2 should be TokenSymbol type in getDexShareCurrencyIdFromCurrencyId');
  }

  const pair = new TokenPair(
    currencyId2Token(token1),
    currencyId2Token(token2)
  ).getPair();

  return api.createType('CurrencyId' as any, { DEXShare: [pair[0].name, pair[1].name] });
}

export function sortCurrency (currency1?: CurrencyId, currency2?: CurrencyId): number {
  const currency1Weight = (currency1 ? TOKEN_WEIGHT.get(currency1?.asToken?.toString()) : 0) || 0;
  const currency2Weight = (currency2 ? TOKEN_WEIGHT.get(currency2?.asToken?.toString()) : 0) || 0;

  return currency1Weight - currency2Weight;
}
