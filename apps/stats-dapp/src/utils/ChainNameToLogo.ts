export function mapChainNameToLogo(chain: string) {
  switch (chain) {
    case 'Unknown':
      return 'tangle';
    case 'None':
      return 'tangle';
    case 'Evm':
      return 'ethereum';
    case 'Substrate':
      return 'substrate';
    case 'PolkadotParachain':
      return 'polkadot';
    case 'KusamaParachain':
      return 'kusama';
    case 'RococoParachain':
      return 'rococo';
    case 'Cosmos':
      return 'cosmos';
    case 'Solana':
      return 'solana';
    case 'Ink':
      return 'ink';
    default:
      return 'tangle';
  }
}
