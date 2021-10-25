import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Faucet from '@webb-dapp/faucet';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import React, { FC } from 'react';

const PageFaucet: FC = () => {
  return <Faucet />;
};

export default pageWithFeatures({
  features: ['mixer'],
  message: 'The mixer module is not supported on the current chain, please change the current network.',
})(PageFaucet);
