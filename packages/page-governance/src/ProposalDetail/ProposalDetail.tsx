import { Icon, Typography } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { IProposal } from '../SubstrateDemocracy';
import { HeadInfo } from './HeadInfo';
import { BackButton, DetailLoader, HeadInfoWrapper, ProposalDetailWrapper } from './styled';
import { useProposalDetail } from './useProposalDetail';

export const ProposalDetail = () => {
  const pallet = useColorPallet();
  const location = useLocation();

  const currentProposal = location.state as IProposal;
  const { fetchVoters, isLoading, votersResponse } = useProposalDetail(currentProposal);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  return (
    <ProposalDetailWrapper>
      {/* {isLoading ? <div>Loading...</div> : !response ? <div>Not found!</div> : <pre>{JSON.stringify(response)}</pre>} */}
      {isLoading ? (
        <DetailLoader src={pallet.type === 'light' ? '/webb-loader.gif' : '/webb-loader-dark.gif'} alt='Webb loader' />
      ) : (
        <HeadInfoWrapper>
          <Link to='/governance/substrate-democracy'>
            <BackButton startIcon={<Icon>arrow_back</Icon>}>All proposals</BackButton>
          </Link>
          {!isLoading && votersResponse?.data && currentProposal ? (
            <HeadInfo {...currentProposal} />
          ) : (
            <Typography variant='h5' style={{ textTransform: 'capitalize', fontWeight: 700 }}>
              Not found proposal
            </Typography>
          )}
        </HeadInfoWrapper>
      )}
    </ProposalDetailWrapper>
  );
};
