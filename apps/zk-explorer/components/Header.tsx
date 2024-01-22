import { FC } from 'react';
import HeaderControls from '../containers/HeaderControls';
import ComputedBreadcrumbs from './ComputedBreadcrumbs';

const Header: FC = () => {
  return (
    <header className="py-4 flex flex-col-reverse sm:flex-row justify-between gap-4">
      <ComputedBreadcrumbs />

      <HeaderControls />
    </header>
  );
};

export default Header;
