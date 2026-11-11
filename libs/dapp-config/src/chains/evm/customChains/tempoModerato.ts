import { EVMChainId } from '@tangle-network/dapp-types';
import { defineChain } from 'viem';

/**
 * Tempo Moderato testnet — the chain running the live tnt-core 0.19 deployment.
 *
 * Unlike every other testnet the dapp wires (which pay gas in ETH), Tempo pays
 * gas in a USD stablecoin. viem's `nativeCurrency` still models it as the
 * 18-decimal base asset; only the name/symbol change. `decimals: 18` matches the
 * other testnet defs so fee/balance formatting stays consistent.
 */
const tempoModerato = defineChain({
  id: EVMChainId.TempoModerato,
  name: 'Tempo Moderato',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.moderato.tempo.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.tempo.xyz',
    },
  },
  testnet: true,
});

export default tempoModerato;
