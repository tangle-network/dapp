import { Typography } from '@material-ui/core';
import { randBrand, randEthereumAddress, randGitCommitMessage, randNumber, randSoonDate } from '@ngneat/falso';
import { TabButton, TabHeader } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import React, { useState } from 'react';

import { ProposalCard } from '../components';
import { ProposalsContainer } from './styled';

export interface SubstrateDemoCracyProps {}

export const SubstrateDemocracy: React.FC<SubstrateDemoCracyProps> = (props) => {
  const [tab, setTab] = useState<'all' | 'active'>('all');

  return (
    <div>
      <Typography variant='h5' component='h2' style={{ fontWeight: 700, marginBottom: '12px' }}>
        Proposals
      </Typography>

      <TabHeader size='sm'>
        <TabButton size='sm' onClick={() => setTab('all')} active={tab === 'all'}>
          <span className='mixer-tab-label'>ALL</span>
        </TabButton>
        <TabButton size='sm' onClick={() => setTab('active')} active={tab === 'active'}>
          <span className='mixer-tab-label'>ACTIVE</span>
        </TabButton>
      </TabHeader>

      <ProposalsContainer>
        <ProposalCard
          address={randEthereumAddress()}
          author={randBrand({ length: 5 })[0]}
          endTime={randSoonDate({ days: 10 }).getTime()}
          status={'executed'}
          title={randGitCommitMessage({ length: randNumber({ min: 5, max: 10 }) })[0]}
          totalVotes={randNumber({ min: 100, max: 500 })}
          voteId={randNumber({ min: 200, max: 1000 })}
        />
      </ProposalsContainer>
    </div>
  );
};
