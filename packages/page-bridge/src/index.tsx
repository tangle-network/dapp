import Bridge from '@webb-dapp/bridge';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import React, { FC } from 'react';

const PageBridge: FC = () => {
  return <Bridge />;
};

export default pageWithFeatures({
  features: ['mixer'],
  message: 'The mixer module is not supported on the current chain, please change the current network.',
})(PageBridge);
