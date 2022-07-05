import { Typography } from '@material-ui/core';
import { useCountdown } from '@webb-dapp/react-hooks';
import { IProposal } from 'page-governance/src/SubstrateDemocracy/useSubstrateDemocracy';
import React, { useCallback } from 'react';

import { ChipStatus } from '../ChipStatus';
import { BadgesGroup, BadgeWrapper, ProposalCardWrapper, TextWrapper } from './styled';

export interface ProposalCardProps extends IProposal {}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  address,
  author,
  endTime,
  status,
  title,
  totalVotes,
  voteId,
}) => {
  const { days, hours, isExpired, minutes, seconds, zeroPad } = useCountdown(endTime);

  const addressFormatter = useCallback((address: string, characters = 6) => {
    if (address.startsWith('0x')) {
      return address.length >= characters * 2 + 2
        ? `${address.slice(2, 2 + characters)}...${address.slice(-characters)}`
        : address;
    }

    return address.length >= characters * 2
      ? `${address.slice(0, characters)}...${address.slice(-characters)}`
      : address;
  }, []);

  return (
    <ProposalCardWrapper>
      <TextWrapper>
        <Typography variant='caption' component='p'>
          By {author} ~ x{addressFormatter(address)}
        </Typography>
        <Typography className='title' variant='h5' component='h6' style={{ fontWeight: 600, marginTop: '8px' }}>
          {title} ~ Vote ID: {voteId}
        </Typography>
      </TextWrapper>
      <BadgesGroup>
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
    </ProposalCardWrapper>
  );
};
