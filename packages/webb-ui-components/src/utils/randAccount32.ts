import { arrayFrom } from './arrayFrom';

function randHexaDecimal(): string {
  return Math.round(Math.random() * 10).toString(16);
}

/**
 * Get a random Polkadot account
 * @returns a Polkadot account (account 32)
 */
export function randAccount32(): string {
  return arrayFrom(64, () => randHexaDecimal()).join('');
}
