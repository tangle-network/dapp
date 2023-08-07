import { Outlet } from 'react-router-dom';
import { ProposalsTable } from '../containers';

const Proposals = () => {
  return (
    <div className="flex flex-col space-y-4">
      <ProposalsTable />

      <Outlet />
    </div>
  );
};

export default Proposals;
