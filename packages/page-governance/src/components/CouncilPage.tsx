import React, { FC, useCallback } from 'react';

import { usePageTitle } from '@webb-dapp/react-environment';

import { CouncilesTab } from './CouncliTab';
import { CouncilType } from '../config';
import { CouncilMembers } from './CouncilMembers';

export const CouncilPage: FC = () => {
  usePageTitle({
    breadcrumb: [
      {
        content: 'Governance Overview',
        path: '/governance'
      }
    ],
    content: 'Council'
  });

  const memberRender = useCallback((council: CouncilType) => <CouncilMembers council={council} />, []);

  return <CouncilesTab contentRender={memberRender} />;
};
