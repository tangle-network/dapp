import Mixer from '@webb-dapp/mixer';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import React, { FC } from 'react';

const PageMixer: FC = () => {
  return <Mixer />;
};

export default pageWithFeatures({
  features: ['mixer'],
  message: 'The mixer module is not supported on the current chain, please change the current network.',
})(PageMixer);
