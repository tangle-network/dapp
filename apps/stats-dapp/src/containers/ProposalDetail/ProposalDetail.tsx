import { useProposal } from '../../provider/hooks';
import { useStatsContext } from '../../provider/stats-provider';
import {
  Button,
  Chip,
  DrawerCloseButton,
  LabelWithValue,
  Progress,
  TimeLine,
  TimeLineItem,
} from '@webb-tools/webb-ui-components/components';
import {
  ArrowLeft,
  ArrowRight,
  BlockIcon,
  Close,
  ExchangeLine,
  Expand,
  ExternalLinkLine,
  Spinner,
  ChainIcon,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import cx from 'classnames';
import { FC, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { mapChainIdToLogo } from '../../utils';

import { ProposersTable } from '../ProposersTable';

import { getProposalsData } from '../../utils';
const ProposalData: FC<{ data: Record<string, any> }> = ({ data }) => {
  const knowProposal = useMemo(() => {
    const keys = Object.keys(data);
    return keys.length === 1 && keys[0] === 'data';
  }, [data]);

  return (
    <div className={'whitespace-pre-wrap'}>
      {JSON.stringify(knowProposal ? data.data : data, null, 2)}
    </div>
  );
};

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
  const passThreshold = useMemo(() => {
    const proposal = proposalDetails.proposal.val;
    if (proposal) {
      console.log(proposal, 'proposal');
      if (proposal.abstainPercentage === 100) {
        return proposal.abstainPercentage;
      }
      return proposal.forPercentage;
    }
    return 0;
  }, [proposalDetails]);
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
  const nextProposalId = proposalDetails.nextAndPrevStatus.val?.nextProposalId;
  const previousProposalId =
    proposalDetails.nextAndPrevStatus.val?.previousProposalId;
  const navigate = useNavigate();

  const handleNextProposal = useCallback(() => {
    if (nextProposalId) {
      navigate(`/proposals${isPage ? '' : '/drawer'}/${nextProposalId}`);
    }
  }, [isPage, navigate, nextProposalId]);

  const handlePrevProposal = useCallback(() => {
    if (previousProposalId) {
      navigate(`/proposals${isPage ? '' : '/drawer'}/${previousProposalId}`);
    }
  }, [isPage, navigate, previousProposalId]);

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
          <div className="flex items-center">
            <LabelWithValue
              className="grow"
              label="Height:"
              value={
                <span className="flex items-center space-x-1">
                  <BlockIcon size="lg" />
                  <Typography variant="mono1">{height}</Typography>
                </span>
              }
            />
          </div>
          <LabelWithValue
            label="Chain:"
            value={
              <span className="flex items-center p-2 space-x-2">
                <ChainIcon
                  name={
                    mapChainIdToLogo(Number(chain)) === 'webb'
                      ? 'tangle'
                      : mapChainIdToLogo(Number(chain))
                  }
                  size="lg"
                />
                <Typography variant="body1" className="block">
                  {mapChainIdToLogo(Number(chain)) === 'webb'
                    ? 'Tangle Network'
                    : mapChainIdToLogo(Number(chain)).charAt(0).toLowerCase() +
                      mapChainIdToLogo(Number(chain)).slice(1)}
                </Typography>
              </span>
            }
          />
          {/** Results */}
          <Typography variant="h5" fw="bold">
            Results
          </Typography>
          <div>
            <Progress value={passThreshold} />
            <div className="flex justify-center mt-1">
              <div className="flex flex-col items-center justify-center">
                <div className="border-[1px] h-2 border-[#ccc] bg-[#ccc]" />
                <Typography variant="utility" className="block uppercase">
                  Pass threshold
                </Typography>
              </div>
            </div>
          </div>
          {/** Percentages */}
          <div className="flex space-x-3">
            <PercentageCard
              type="for"
              percentValue={forPercentage}
              count={forCount}
            />
            <PercentageCard
              type="against"
              percentValue={againstPercentage}
              count={againstCount}
            />
            <PercentageCard
              type="abstain"
              percentValue={abstainPercentage}
              count={abstainCount}
            />
          </div>
          {/** Timeline */}
          <Typography variant="h5" fw="bold">
            Timeline
          </Typography>
          <TimeLine className="translate-x-3">
            {timeline.map((time, idx) => (
              <TimeLineItem
                key={`${time.at.toString()}-${idx}`}
                title={time.status}
                time={time.at}
                txHash=''
                externalUrl="#"
              />
            ))}
          </TimeLine>
          {/** Detail */}
          <Typography variant="h5" fw="bold">
            Details
          </Typography>
          <div className="p-4 break-all rounded-lg bg-mono-20 dark:bg-mono-160">
            <Typography variant="mono2" component="p">
              Type: {proposalData.type}
            </Typography>
            <br />
            <Typography variant="mono2" component="p">
              <ProposalData
                data={getProposalsData(proposalData.type, proposalData.data)}
              />
            </Typography>
          </div>
        </>
      );
    }

    return (
      <div className="flex items-center justify-center min-w-full min-h-[384px]">
        <Spinner size="xl" />
      </div>
    );
  }, [proposalDetails, passThreshold]);

  return (
    <div className="flex flex-col p-6 space-y-6 rounded-lg bg-mono-0 dark:bg-mono-180">
      {/** The title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to={isPage ? '/proposals' : `/proposals/${proposalId}`}>
            {isPage ? (
              <div className={'flex flex-row items-center'}>
                <ArrowLeft size="lg" />{' '}
                <Typography variant={'body2'} fw={'bold'}>
                  Back to proposals
                </Typography>
              </div>
            ) : (
              <Expand size="lg" />
            )}
          </Link>

          {status && <Chip>{status}</Chip>}

          <Typography variant="h4" fw="bold">
            Proposal Details
          </Typography>
        </div>

        <div className="flex items-center space-x-2">
          {/** Previous/Next Buttons */}
          <Button
            size="sm"
            onClick={handlePrevProposal}
            isDisabled={
              previousProposalId === null || previousProposalId === undefined
            }
            leftIcon={<ArrowLeft className="!fill-current" />}
            variant="utility"
          >
            Prev
          </Button>
          <Button
            size="sm"
            isDisabled={nextProposalId === null || nextProposalId === undefined}
            onClick={handleNextProposal}
            rightIcon={<ArrowRight className="!fill-current" />}
            variant="utility"
          >
            Next
          </Button>

          {/** Close modal */}
          {!isPage && (
            <DrawerCloseButton>
              <Close size="lg" />
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

const PercentageCard: FC<{
  type: VoteType;
  percentValue: number;
  count: number;
}> = (props) => {
  const { count, percentValue, type } = props;

  return (
    <div
      className={cx(
        'p-3 flex space-x-[6px] items-center rounded-lg grow',
        classNames[type]
      )}
    >
      <Typography variant="h5" fw="bold" className="!text-inherit">
        {percentValue}%
      </Typography>
      <Typography variant="utility" className="!text-inherit uppercase">
        {type} {count}
      </Typography>
    </div>
  );
};
