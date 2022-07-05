import { TablePagination, Typography } from '@material-ui/core';
import { TabButton, TabHeader } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { Fragment, useCallback, useEffect, useState } from 'react';

import { LoadingProposals, ProposalCard } from '../components';
import { ProposalsContainer } from './styled';
import { useSubstrateDemocracy } from './useSubstrateDemocracy';

export interface SubstrateDemoCracyProps {}

const INITIAL_PAGE = 0;
const INITIAL_ITEMS_PER_PAGE = 5;

export const SubstrateDemocracy: React.FC<SubstrateDemoCracyProps> = (props) => {
  const { isXsOrAbove } = useBreakpoint();
  const [tab, setTab] = useState<'all' | 'active'>('all');
  const { fetchActiveProposals, fetchAllProposals, isLoading, response } = useSubstrateDemocracy();

  /** Pagination */
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(INITIAL_ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = useState(0);

  const onTabChange = useCallback(
    (nextTab: 'all' | 'active') => {
      if (nextTab === tab) {
        return;
      }

      if (nextTab === 'all') {
        fetchAllProposals(0, itemsPerPage);
      } else {
        fetchActiveProposals(0, itemsPerPage);
      }
      setCurrentPage(INITIAL_PAGE);
      setItemsPerPage(INITIAL_ITEMS_PER_PAGE);
      setTab(nextTab);
    },
    [fetchActiveProposals, fetchAllProposals, itemsPerPage, tab]
  );

  const onPageChange = useCallback(async (_, nextPage: number) => {
    setCurrentPage(nextPage);
  }, []);

  const onItemsPerPageChange = useCallback((eve: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItemsPerPage(parseInt(eve.target.value, 10));
    setCurrentPage(0);
  }, []);

  useEffect(() => {
    const newOffset = currentPage * itemsPerPage;
    if (tab === 'all') {
      fetchAllProposals(newOffset, itemsPerPage);
    } else {
      fetchActiveProposals(newOffset, itemsPerPage);
    }
  }, [currentPage, fetchActiveProposals, fetchAllProposals, itemsPerPage, tab]);

  useEffect(() => {
    if (response) {
      setTotalItems(response.total);
    }
  }, [response]);

  return (
    <div>
      <Typography
        variant={isXsOrAbove ? 'h3' : 'h4'}
        component='h2'
        style={{ fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}
      >
        Proposals
      </Typography>

      <TabHeader size='sm'>
        <TabButton size='sm' active={tab === 'all'} onClick={() => onTabChange('all')}>
          <span className='mixer-tab-label'>ALL</span>
        </TabButton>
        <TabButton size='sm' active={tab === 'active'} onClick={() => onTabChange('active')}>
          <span className='mixer-tab-label'>ACTIVE</span>
        </TabButton>
      </TabHeader>

      <ProposalsContainer>
        {isLoading || !response ? (
          <LoadingProposals />
        ) : (
          <Fragment>
            {response.data.map((proposal) => (
              <ProposalCard key={proposal.voteId} {...proposal} />
            ))}

            <TablePagination
              component='div'
              count={totalItems}
              page={currentPage}
              onPageChange={onPageChange}
              rowsPerPage={itemsPerPage}
              rowsPerPageOptions={[5, 10, 15]}
              onRowsPerPageChange={onItemsPerPageChange}
            />
          </Fragment>
        )}
      </ProposalsContainer>
    </div>
  );
};
