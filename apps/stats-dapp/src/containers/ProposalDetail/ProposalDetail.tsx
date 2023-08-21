import {
  Button,
  Chip,
  DrawerCloseButton,
} from '@webb-tools/webb-ui-components/components';
import { useBatchedProposal } from '../../provider/hooks/useProposals';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { getProposalsData } from '../../utils/getProposalsData';
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Expand,
  ChainIcon,
  ProposalVariant,
} from '@webb-tools/icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProposalBatchStatus, ProposalType } from '../../generated/graphql';
import { Typography } from '@webb-tools/webb-ui-components';
import ProposalBadge from '@webb-tools/icons/ProposalBadge/ProposalBadge';
import { StatusChip } from '../ProposalsTable';
import { mapChainNameToLogo } from '../../utils';

export const ProposalDetail = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { proposalBatchId = '' } = useParams<{ proposalBatchId: string }>();

  const batchedProposal = useBatchedProposal(proposalBatchId);

  const isPage = useMemo(() => {
    return !pathname.includes('drawer');
  }, [pathname]);

  const proposalsWithCount = useMemo(() => {
    if (batchedProposal.val) {
      return batchedProposal.val.proposals.reduce<
        {
          type: string;
          count: number;
        }[]
      >((acc, item) => {
        const found = acc.find(
          (e: { type: string; count: number }) => e.type === item.type
        );
        if (found) {
          found.count++;
        } else {
          acc.push({ type: item.type, count: 1 });
        }
        return acc;
      }, []);
    }

    return [];
  }, [batchedProposal]);

  const [proposalIds, setProposalIds] = useState<string[]>([]);

  useEffect(() => {
    const proposalIds = localStorage.getItem('proposalIds');
    if (proposalIds) {
      setProposalIds(JSON.parse(proposalIds));
    }
  }, [proposalBatchId]);

  const nextProposalBatchId =
    proposalIds[proposalIds.indexOf(proposalBatchId) + 1];

  const previousProposalBatchId =
    proposalIds[proposalIds.indexOf(proposalBatchId) - 1];

  const handleNextProposalBatch = useCallback(() => {
    if (nextProposalBatchId) {
      navigate(`/proposals${isPage ? '' : '/drawer'}/${nextProposalBatchId}`);
    }
  }, [isPage, navigate, nextProposalBatchId]);

  const handlePrevProposalBatch = useCallback(() => {
    if (previousProposalBatchId) {
      navigate(
        `/proposals${isPage ? '' : '/drawer'}/${previousProposalBatchId}`
      );
    }
  }, [isPage, navigate, previousProposalBatchId]);

  const proposals = useMemo(() => {
    if (batchedProposal.val) {
      const proposalsArr = batchedProposal.val.proposals.map((proposal) => {
        return {
          ...proposal,
          decodedData: getProposalsData(
            proposal.type as ProposalType,
            proposal.data
          ),
        };
      });

      return proposalsArr;
    }

    return [];
  }, [batchedProposal]);

  const [proposalToShow, setProposalToShow] = useState(0);

  const handleNextProposal = () => {
    if (proposalToShow < proposals.length - 1) {
      setProposalToShow((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousProposal = () => {
    if (proposalToShow > 0) {
      setProposalToShow((prevIndex) => prevIndex - 1);
    }
  };

  const currentProposal = useMemo(() => {
    return proposals[proposalToShow];
  }, [proposalToShow, proposals]);

  return (
    <div>
      {/* General Container */}
      <div className="flex flex-col p-6 space-y-6 rounded-lg bg-mono-0 dark:bg-mono-180">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to={isPage ? '/proposals' : `/proposals/${proposalBatchId}`}>
              {isPage ? (
                <div className={'flex flex-row items-center'}>
                  <ArrowLeft size="lg" />
                </div>
              ) : (
                <Expand size="lg" />
              )}
            </Link>

            {batchedProposal.val?.status && (
              <StatusChip
                status={batchedProposal.val?.status as ProposalBatchStatus}
              />
            )}

            <Typography variant="h4" fw="bold">
              Proposal Details
            </Typography>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handlePrevProposalBatch}
              isDisabled={
                previousProposalBatchId === null ||
                previousProposalBatchId === undefined
              }
              leftIcon={<ArrowLeft className="!fill-current" />}
              variant="utility"
            >
              Prev
            </Button>

            <Button
              size="sm"
              isDisabled={
                nextProposalBatchId === null ||
                nextProposalBatchId === undefined
              }
              onClick={handleNextProposalBatch}
              rightIcon={<ArrowRight className="!fill-current" />}
              variant="utility"
            >
              Next
            </Button>

            {!isPage && (
              <DrawerCloseButton>
                <Close size="lg" />
              </DrawerCloseButton>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="body4" fw="bold" className="uppercase">
            Proposals:
          </Typography>

          {proposalsWithCount.map((proposal, idx) => {
            return (
              <div
                className="flex items-center gap-1"
                key={`${proposal.type}-${idx}`}
              >
                <ProposalBadge variant={proposal.type as ProposalVariant} />
                <Typography variant="body1" fw="bold">
                  {proposal.type}
                </Typography>
                ({proposal.count})
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-20">
          <div className="flex gap-2 items-center">
            <Typography variant="body4" fw="bold" className="uppercase">
              Block Height:
            </Typography>

            <Typography variant="mono1" className="uppercase">
              {batchedProposal.val?.height}
            </Typography>
          </div>

          <div className="flex gap-2 items-center">
            <Typography variant="body4" fw="bold" className="uppercase">
              Batch ID:
            </Typography>

            <Chip color="blue">{batchedProposal.val?.id}</Chip>
          </div>

          <div className="flex gap-2 items-center">
            <Typography variant="body4" fw="bold" className="uppercase">
              Chain:
            </Typography>

            <ChainIcon
              name={mapChainNameToLogo(batchedProposal.val?.chain as string)}
              size="lg"
            />

            <Typography variant="body1" fw="bold" className="capitalize">
              {mapChainNameToLogo(batchedProposal.val?.chain as string)}
            </Typography>
          </div>
        </div>
      </div>

      {/* Proposal Details Container */}
      <div
        className={`flex flex-col p-6 space-y-6 rounded-lg bg-mono-0 dark:bg-mono-180 ${
          isPage ? 'mt-[22px]' : ''
        }`}
      >
        <div>
          <div className="flex flex-col gap-4">
            <Typography variant="h5" fw="bold">
              Proposal Details
            </Typography>

            <div className="flex items-center gap-2">
              <Typography variant="body4" fw="bold" className="uppercase">
                Proposal:
              </Typography>

              <div className="flex items-center gap-1">
                <ProposalBadge
                  variant={
                    currentProposal
                      ? (currentProposal.type as ProposalVariant)
                      : 'Refresh'
                  }
                />

                <Typography variant="body1" fw="semibold">
                  {currentProposal ? currentProposal.type : ''}
                </Typography>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 break-all rounded-lg bg-mono-20 dark:bg-mono-160">
                <Typography variant="mono1" component="p">
                  Type: {currentProposal ? currentProposal.type : ''}
                </Typography>
                <br />
                <ProposalDecodedData
                  data={currentProposal ? currentProposal.decodedData : {}}
                />
              </div>

              <div className="flex items-center justify-between">
                <Typography variant="body1" fw="normal" className="">
                  {`Proposal(s) ${proposalToShow + 1} out of ${
                    proposals.length
                  }`}
                </Typography>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={handlePreviousProposal}
                    isDisabled={proposalToShow === 0 || proposals.length === 0}
                    leftIcon={<ArrowLeft className="!fill-current" />}
                    variant="utility"
                  >
                    Prev
                  </Button>

                  <Button
                    size="sm"
                    isDisabled={
                      proposalToShow === proposals.length - 1 ||
                      proposals.length === 0
                    }
                    onClick={handleNextProposal}
                    rightIcon={<ArrowRight className="!fill-current" />}
                    variant="utility"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProposalDecodedData: FC<{ data: Record<string, any> }> = ({ data }) => {
  const knowProposal = useMemo(() => {
    const keys = Object.keys(data);
    return keys.length === 1 && keys[0] === 'data';
  }, [data]);

  return (
    <div className="whitespace-pre-wrap !dark:text-mono-80 text-mono-200">
      {JSON.stringify(knowProposal ? data.data : data, null, 2)}
    </div>
  );
};
