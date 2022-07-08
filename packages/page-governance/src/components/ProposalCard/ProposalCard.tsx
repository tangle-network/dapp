import { useCountdown } from '@webb-dapp/react-hooks';
import { IProposal } from 'page-governance/src/SubstrateDemocracy/useSubstrateDemocracy';
import React, { Fragment } from 'react';

import { CardTitle } from '../CardTitle';
import { ChipStatus } from '../ChipStatus';
import { BadgesGroup, BadgeWrapper } from './styled';

export interface ProposalCardProps extends IProposal {
  isAlignLeftAll?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  address,
  author,
  endTime,
  isAlignLeftAll,
  status,
  title,
  totalVotes,
  voteId,
}) => {
  const { days, hours, isExpired, minutes, seconds, zeroPad } = useCountdown(endTime);

  return (
    <Fragment>
      <CardTitle address={address} author={author} title={title} voteId={voteId} />
      <BadgesGroup isAlignStart={isAlignLeftAll}>
        {!isExpired && (
          <BadgeWrapper>
            Ends
            <b className='bold'>
              {zeroPad(days)}d:{zeroPad(hours)}h:{zeroPad(minutes)}min:{zeroPad(seconds)}sec
            </b>
          </BadgeWrapper>
        )}
        <BadgeWrapper>
          Votes <b className='bold'>{totalVotes}</b>
        </BadgeWrapper>
        <ChipStatus status={status} />
      </BadgesGroup>
    </Fragment>
  );
};
