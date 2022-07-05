import { TablePagination, Typography } from '@material-ui/core';
import { TabButton, TabHeader } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ProposalCard, ProposalLoading } from '../components';
import { ProposalsContainer } from './styled';
import { useSubstrateDemocracy } from './useSubstrateDemocracy';

export interface SubstrateDemoCracyProps {}

export const SubstrateDemocracy: React.FC<SubstrateDemoCracyProps> = (props) => {
  const [tab, setTab] = useState<'all' | 'active'>('all');
  const { fetchAllProposals, isLoading, response } = useSubstrateDemocracy();

  /** Pagiantion */
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = useMemo(() => (response ? response.total : 0), [response]);

  const onPageChange = useCallback(
    async (_, nextPage: number) => {
      if (nextPage === currentPage) {
        return;
      }

      setCurrentPage(nextPage);
    },
    [currentPage]
  );

  const onItemsPerPageChange = useCallback((eve: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItemsPerPage(parseInt(eve.target.value, 10));
    setCurrentPage(0);
  }, []);

  useEffect(() => {
    fetchAllProposals(currentPage, itemsPerPage);
  }, [currentPage, fetchAllProposals, itemsPerPage]);

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
        {isLoading || !response ? (
          <ProposalLoading />
        ) : (
          response.data.map((proposal) => <ProposalCard key={proposal.voteId} {...proposal} />)
        )}

        {response && (
          <TablePagination
            component='div'
            count={totalItems}
            page={currentPage}
            onPageChange={onPageChange}
            rowsPerPage={itemsPerPage}
            onRowsPerPageChange={onItemsPerPageChange}
          />
        )}
      </ProposalsContainer>
    </div>
  );
};
