import { Icon, Typography } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Fragment, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ProposalCard } from '../components';
import { IProposal } from '../SubstrateDemocracy';
import { CastVote } from './CastVote';
import { BackButton, DetailLoader, HeadInfoWrapper, ProposalDetailWrapper } from './styled';
import { useProposalDetail } from './useProposalDetail';

export const ProposalDetail = () => {
  const pallet = useColorPallet();
  const location = useLocation();

  const currentProposal = location.state as IProposal;
  const { fetchVoters, isLoading, noVotesAmount, votersResponse, yesVotesAmount } = useProposalDetail(currentProposal);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  return (
    <ProposalDetailWrapper>
      {/* {isLoading ? <div>Loading...</div> : !response ? <div>Not found!</div> : <pre>{JSON.stringify(response)}</pre>} */}
      {isLoading ? (
        <DetailLoader src={pallet.type === 'light' ? '/webb-loader.gif' : '/webb-loader-dark.gif'} alt='Webb loader' />
      ) : (
        <Fragment>
          <HeadInfoWrapper>
            <Link to='/governance/substrate-democracy'>
              <BackButton startIcon={<Icon>arrow_back</Icon>}>All proposals</BackButton>
            </Link>
            {!isLoading && votersResponse?.data && currentProposal ? (
              <ProposalCard {...currentProposal} isAlignLeftAll={true} />
            ) : (
              <Typography variant='h5' style={{ textTransform: 'capitalize', fontWeight: 700 }}>
                Not found proposal
              </Typography>
            )}
          </HeadInfoWrapper>
          {!isLoading && votersResponse?.data && currentProposal && (
            <Fragment>
              <CastVote yesVotesAmount={yesVotesAmount} noVotesAMount={noVotesAmount} />
            </Fragment>
          )}
        </Fragment>
      )}
    </ProposalDetailWrapper>
  );
};
