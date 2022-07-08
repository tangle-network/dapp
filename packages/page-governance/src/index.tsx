import React, { useCallback, useState } from 'react';

import { ProposalDetail } from './ProposalDetail';
import { IProposal, SubstrateDemocracy } from './SubstrateDemocracy';

export type PageGovernanceProps = {
  view: 'substrate-democracy' | 'proposal-detail';
};

const PageGovernance: React.FC<PageGovernanceProps> = ({ view = 'substrate-democracy' }) => {
  switch (view) {
    case 'proposal-detail': {
      return <ProposalDetail />;
    }

    case 'substrate-democracy':
    default: {
      return <SubstrateDemocracy />;
    }
  }
};

export default PageGovernance;
