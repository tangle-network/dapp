import { InternalChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { AppConfig } from '@webb-dapp/react-environment/webb-context';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [WebbCurrencyId.webbWETH]: [
    {
      amount: '0.1',
      anchorAddresses: {
        [InternalChainId.Ropsten]: '0x97747a4De7302Ff7Ee3334e33138879469BFEcf8',
        [InternalChainId.Rinkeby]: '0x09B722aA809A076027FA51902e431a8C03e3f8dF',
        [InternalChainId.Goerli]: '0x6aA5C74953F7Da1556a298C5e129E417410474E2',
        [InternalChainId.PolygonTestnet]: '0x12323BcABB342096669d80F968f7a31bdB29d4C4',
        [InternalChainId.OptimismTestnet]: '0xC44A4EcAC4f23b6F92485Cb1c90dBEd75a987BC8',
        [InternalChainId.ArbitrumTestnet]: '0xD8a8F9629a98EABFF31CfA9493f274A4D5e768Cd',
      },
    },
  ],
};
