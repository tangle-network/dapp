import MixerTabs from '@webb-dapp/mixer';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import React, { FC } from 'react';

const PageBridge: FC = () => {
  return <MixerTabs />;
};

export default pageWithFeatures({
  features: ['mixer'],
  message: 'The mixer module is not supported on the current chain, please change the current network.',
})(PageBridge);
