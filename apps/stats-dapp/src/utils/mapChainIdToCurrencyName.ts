import { chainsConfig } from '@webb-tools/dapp-config';

export function mapChainIdToLogo(number: number) {
  if (number === 0) {
    return 'webb';
  }
  return String(chainsConfig[number]?.currencies[0] ?? 'webb');
}
