import { FC } from 'react';
import { Filters } from './Filters/Filters';
import { FilterConstraints } from './Filters/types';

export type MobileFiltersSidebarProps = {
  onMobileConstraintsChange: (constraints: FilterConstraints) => void;
  onClose: () => void;
};

export const MobileFiltersSidebar: FC<MobileFiltersSidebarProps> = ({
  onMobileConstraintsChange,
  onClose,
}) => {
  return (
    <>
      {/* Overlay darkening mask */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 z-10" />

      {/* Sidebar */}
      <div className="absolute top-0 right-0 bottom-0 bg-mono-190 z-20 px-9 py-6 min-w-[344px]">
        <Filters
          hasCloseButton
          onClose={onClose}
          onConstraintsChange={onMobileConstraintsChange}
        />
      </div>
    </>
  );
};
