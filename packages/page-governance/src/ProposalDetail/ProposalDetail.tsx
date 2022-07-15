import { Icon, Typography } from '@mui/material';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Fragment, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ProposalCard } from '../components';
import { IProposal } from '../SubstrateDemocracy';
import { CastVote } from './CastVote';
import { Description } from './Description';
import { BackButton, DetailLoader, HeadInfoWrapper, ProposalDetailWrapper } from './styled';
import { useProposalDetail } from './useProposalDetail';
import { VoteResult } from './VoteResult';
import { VotersTable } from './VotersTable';

export const ProposalDetail = () => {
  const pallet = useColorPallet();
  const location = useLocation();

  const currentProposal = location.state as IProposal;
  const { fetchAllVoters, isLoading, noVotesAmount, votersResponse, yesVotesAmount } =
    useProposalDetail(currentProposal);

  const yesPercent = useMemo(() => {
    if (!votersResponse) {
      return 0;
    }

    return Math.round((yesVotesAmount / votersResponse.data.length) * 100);
  }, [votersResponse, yesVotesAmount]);

  const noPercent = useMemo(() => {
    if (!votersResponse) {
      return 0;
    }

    return 100 - yesPercent;
  }, [votersResponse, yesPercent]);

  useEffect(() => {
    fetchAllVoters();
  }, [fetchAllVoters]);

  return (
    <ProposalDetailWrapper>
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
              {currentProposal.status === 'active' ? (
                <CastVote yesVotesAmount={yesVotesAmount} noVotesAMount={noVotesAmount} />
              ) : (
                <VoteResult yesPercent={yesPercent} noPercent={noPercent} />
              )}
              {currentProposal.description && <Description description={currentProposal.description} />}
              <VotersTable voters={votersResponse.data} />
            </Fragment>
          )}
        </Fragment>
      )}
    </ProposalDetailWrapper>
  );
};
