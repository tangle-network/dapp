import { RelayerConfig, WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';
import { ChainId } from '@webb-dapp/apps/configs/chains';

let builder: WebbRelayerBuilder | null = null;
export const relayerConfig: RelayerConfig[] = [
  {
    address: 'http://localhost:9955',
  },
  {
    address: 'http://nepoche.com:9955',
  },
];

export async function getWebbRelayer() {
  if (!builder) {
    builder = await WebbRelayerBuilder.initBuilder(relayerConfig, (name, basedOn) => {
      if (basedOn === 'evm') {
        switch (name) {
          case 'beresheet':
            return ChainId.EdgewareTestNet;
        }
      }
      if (basedOn === 'substrate') {
        return null;
      }
      return null;
    });
  }
  return builder;
}
