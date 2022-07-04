import React from 'react';

import { SubstrateDemocracy } from './SubstrateDemocracy';

export type PageGovernanceProps = {
  view: 'substrate-democracy';
};

const PageGovernance: React.FC<PageGovernanceProps> = ({ view = 'substrate-democracy' }) => {
  switch (view) {
    case 'substrate-democracy':
    default: {
      return <SubstrateDemocracy />;
    }
  }
};

export default PageGovernance;
