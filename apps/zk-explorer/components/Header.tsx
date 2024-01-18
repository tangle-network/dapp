import { FC } from 'react';
import ComputedBreadcrumbs from './ComputedBreadcrumbs';
import { HeaderControls } from './HeaderControls';

export const Header: FC<unknown> = () => {
  return (
    <header className="py-4 flex flex-col-reverse sm:flex-row justify-between gap-4">
      <ComputedBreadcrumbs />

      <HeaderControls />
    </header>
  );
};
