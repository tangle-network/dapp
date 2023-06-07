import { Outlet } from 'react-router-dom';
import { KeygenTable, KeyStatusCardContainer } from '../containers';

const Keys = () => {
  return (
    <div className="flex flex-col space-y-4">
      <KeyStatusCardContainer />

      <KeygenTable />

      <Outlet />
    </div>
  );
};

export default Keys;
