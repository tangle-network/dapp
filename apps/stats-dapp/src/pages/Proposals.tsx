import { useBatchedProposal, useBatchedProposals } from '../provider';

const Proposals = () => {
  // All Batched Proposals
  const batchedProposals = useBatchedProposals({
    offset: 0,
    perPage: 10,
    filter: null,
  });

  // Single Batched Proposal
  const batchedProposal = useBatchedProposal('10');

  // console.log('Batched Proposals', batchedProposals);

  // console.log('Batched Proposal', batchedProposal);

  return <div className="flex flex-col space-y-4">Proposal Page</div>;
};

export default Proposals;
