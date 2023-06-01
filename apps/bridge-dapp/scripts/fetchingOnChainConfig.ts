import { ApiConfig } from '@webb-tools/dapp-config/src/api-config';
import { chainsConfig } from '@webb-tools/dapp-config/src/chains/chain-config';
import { walletsConfig } from '@webb-tools/dapp-config/src/wallets/wallets-config';
import { substrateProviderFactory } from '@webb-tools/polkadot-api-provider/src/utils';
import { evmProviderFactory } from '@webb-tools/web3-api-provider/src/utils';

async function main() {
  const config = await ApiConfig.initFromApi(
    {
      chains: chainsConfig,
      wallets: walletsConfig,
    },
    evmProviderFactory,
    substrateProviderFactory
  );

  console.log(JSON.stringify(config, null, 2));
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
