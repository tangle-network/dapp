import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import React from 'react';
import ContentLoader from 'react-content-loader';

import { LoadingCardWrapper } from './styled';

export const LoadingCard = () => {
  const pallet = useColorPallet();

  return (
    <LoadingCardWrapper>
      <ContentLoader
        speed={2}
        width={88}
        height={104}
        viewBox='0 0 88 104'
        backgroundColor={pallet.lightSelectionBackground}
        foregroundColor={pallet.type === 'dark' ? pallet.layer1Background : pallet.heavySelectionBackground}
      >
        <rect x='2' y='13' rx='5' ry='5' width='88' height='16' />
        <rect x='0' y='40' rx='5' ry='5' width='88' height='32' />
      </ContentLoader>
    </LoadingCardWrapper>
  );
};
