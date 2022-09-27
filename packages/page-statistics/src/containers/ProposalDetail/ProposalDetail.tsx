import { randHexaDecimal, randNumber, randRecentDate } from '@ngneat/falso';
import { ProposalType } from '@webb-dapp/page-statistics/generated/graphql';
import { ProposalDetails, ProposalStatus, useProposal } from '@webb-dapp/page-statistics/provider/hooks';
import { useStatsContext } from '@webb-dapp/page-statistics/provider/stats-provider';
import {
  Button,
  Chip,
  DrawerCloseButton,
  LabelWithValue,
  Progress,
  TimeLine,
  TimeLineItem,
} from '@webb-dapp/webb-ui-components/components';
import { useSeedData } from '@webb-dapp/webb-ui-components/hooks';
import {
  ArrowLeft,
  ArrowRight,
  Block,
  Close,
  ExchangeLine,
  Expand,
  ExternalLinkLine,
  TokenIcon,
} from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { randomEnum, shortenHex } from '@webb-dapp/webb-ui-components/utils';
import cx from 'classnames';
import { BigNumber } from 'ethers';
import { FC, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { ProposersTable } from '../ProposersTable';

export const ProposalDetail = () => {
  const { pathname } = useLocation();
  const { proposalId = '' } = useParams<{ proposalId: string }>();
  const {
    metaData: { activeSession },
  } = useStatsContext();
  const query = useMemo<Parameters<typeof useProposal>>(() => {
    return [
      activeSession,
      {
        filter: {
          proposalId,
        },
        perPage: 10,
        offset: 0,
      },
    ];
  }, [activeSession, proposalId]);
  const proposalDetails = useProposal(...query);

  const isPage = useMemo(() => {
    return !pathname.includes('drawer');
  }, [pathname]);

  // Result threshold
  const passThreshold = useMemo(() => randNumber({ min: 0, max: 100 }), []);
  const status = useMemo(() => {
    return proposalDetails.proposal.val?.status ?? null;
  }, [proposalDetails]);
  const counters = useMemo(() => {
    if (proposalDetails.proposal.val) {
      const details = proposalDetails.proposal.val;

      return {
        for: details.forCount,
        abstain: details.abstainCount,
        against: details.againstCount,
        all: details.allCount,
      };
    }
    return {
      for: 0,
      abstain: 0,
      against: 0,
      all: 0,
    };
  }, [proposalDetails]);
  const Overview = useMemo(() => {
    if (proposalDetails.proposal.val) {
      const {
        abstainCount,
        abstainPercentage,
        againstCount,
        againstPercentage,
        chain,
        data: proposalData,
        forCount,
        forPercentage,
        height,
        timeline,
        txHash,
      } = proposalDetails.proposal.val;
      return (
        <>
          {/** Height, tx hash and chain data */}
          <div className='flex items-center'>
            <LabelWithValue
              className='grow'
              label='height:'
              value={
                <span className='flex items-center space-x-1'>
                  <Block size='lg' />
                  <Typography variant='mono1'>{height}</Typography>
                </span>
              }
            />

            <LabelWithValue
              className='grow'
              label='tx hash:'
              value={
                <span className='flex items-center space-x-1'>
                  <ExchangeLine size='lg' />
                  <div className='flex items-center space-x-1'>
                    <LabelWithValue
                      labelVariant='body3'
                      label='tx hash:'
                      isHiddenLabel
                      value={shortenHex(txHash)}
                      valueTooltip={txHash}
                    />
                    <a href='#'>
                      <ExternalLinkLine />
                    </a>
                  </div>
                </span>
              }
            />
          </div>
          <LabelWithValue
            label='chain:'
            value={
              <span className='flex items-center p-2 space-x-2'>
                <TokenIcon name={chain} size='lg' />
                <Typography variant='body1' className='block uppercase'>
                  {chain}
                </Typography>
              </span>
            }
          />
          {/** Results */}
          <Typography variant='h5' fw='bold'>
            Results
          </Typography>
          <div>
            <Progress value={passThreshold} />
            <div className='flex justify-center mt-1'>
              <div className='flex flex-col items-center justify-center'>
                <div className='border-[1px] h-2 border-[#ccc] bg-[#ccc]' />
                <Typography variant='body4' fw='bold' className='block uppercase'>
                  Pass threshold
                </Typography>
              </div>
            </div>
          </div>
          {/** Percentages */}
          <div className='flex space-x-3'>
            <PercentageCard type='for' percentValue={forPercentage} count={forCount} />
            <PercentageCard type='against' percentValue={againstPercentage} count={againstCount} />
            <PercentageCard type='abstain' percentValue={abstainPercentage} count={abstainCount} />
          </div>
          {/** Timeline */}
          <Typography variant='h5' fw='bold'>
            Timeline
          </Typography>
          <TimeLine className='translate-x-3'>
            {timeline.map((time, idx) => (
              <TimeLineItem
                key={`${time.at.toString()}-${idx}`}
                title={time.status}
                time={time.at}
                txHash={time.hash}
                externalUrl='#'
              />
            ))}
          </TimeLine>
          {/** Detail */}
          <Typography variant='h5' fw='bold'>
            Details
          </Typography>
          <div className='p-4 break-all rounded-lg bg-mono-20 dark:bg-mono-160'>
            <Typography variant='mono2' component='p'>
              Type: {proposalData.type}
            </Typography>
            <br />
            <Typography variant='mono2' component='p'>
              Data: {proposalData.data}
            </Typography>
          </div>
        </>
      );
    }
    return <div>Loading...</div>;
  }, [proposalDetails]);
  return (
    <div className='flex flex-col p-6 space-y-6 rounded-lg bg-mono-0 dark:bg-mono-180'>
      {/** The title */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Link to={isPage ? '/proposals' : `/proposals/${proposalId}`}>
            {isPage ? <ArrowLeft size='lg' /> : <Expand size='lg' />}
          </Link>

          <Chip className='uppercase'>{status || 'Loading...'}</Chip>

          <Typography variant='h4' fw='bold'>
            Proposal Details
          </Typography>

          <Button varirant='utility' size='sm' className='uppercase'>
            Open Governance
          </Button>
        </div>

        <div className='flex items-center space-x-2'>
          {/** Previous/Next Buttons */}
          <Button size='sm' leftIcon={<ArrowLeft className='!fill-current' />} varirant='utility' className='uppercase'>
            Prev
          </Button>
          <Button
            size='sm'
            rightIcon={<ArrowRight className='!fill-current' />}
            varirant='utility'
            className='uppercase'
          >
            Next
          </Button>

          {/** Close modal */}
          {!isPage && (
            <DrawerCloseButton>
              <Close size='lg' />
            </DrawerCloseButton>
          )}
        </div>
      </div>
      {Overview}
      {/** All proposers */}
      <ProposersTable counters={counters} proposalId={proposalId} />
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

export type VoteType = 'for' | 'against' | 'abstain';

const classNames = {
  for: 'bg-green-10 dark:bg-green-120 text-green-70 dark:text-green-50',
  against: 'bg-red-10 dark:bg-red-120 text-red-70 dark:text-red-50',
  abstain: 'bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-50',
};

const PercentageCard: FC<{ type: VoteType; percentValue: number; count: number }> = (props) => {
  const { count, percentValue, type } = props;

  return (
    <div className={cx('p-3 flex space-x-[6px] items-center rounded-lg grow', classNames[type])}>
      <Typography variant='h5' fw='bold' className='!text-inherit'>
        {percentValue}%
      </Typography>
      <Typography variant='body4' fw='bold' className='!text-inherit uppercase'>
        {type} {count}
      </Typography>
    </div>
  );
};
