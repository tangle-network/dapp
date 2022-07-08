import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useProposalDetail } from './useProposalDetail';

export const ProposalDetail = () => {
  const { voteId } = useParams();
  const { fetchVoters, isLoading, response } = useProposalDetail(voteId);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  return (
    <div>
      {isLoading ? <div>Loading...</div> : !response ? <div>Not found!</div> : <pre>{JSON.stringify(response)}</pre>}
    </div>
  );
};
