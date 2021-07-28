import { Relayerconfig, WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';

let builder: WebbRelayerBuilder | null = null;
export const relayerConfig: Relayerconfig[] = [
  {
    address: 'http://localhost:9955',
  },
];

export async function getWebbRelayer() {
  if (!builder) {
    builder = await WebbRelayerBuilder.initBuilder(relayerConfig);
  }
  return builder;
}
