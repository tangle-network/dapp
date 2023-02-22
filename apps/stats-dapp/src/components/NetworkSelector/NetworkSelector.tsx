import { FC, useState } from 'react';
import { NetworkType } from './types';
import { RadioGroup, RadioItem } from '@webb-tools/webb-ui-components';

export const NetworkSelector: FC = () => {
  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkType['type']>('testnet');

  return (
    <div>
      <div>Chains</div>

      <div>Radio Buttons</div>
    </div>
  );
};
