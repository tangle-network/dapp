import { FC } from 'react';
import { Filters } from './Filters/Filters';
import { OverlayMask } from './OverlayMask';

export type MobileFiltersSidebarProps = {
  onClose: () => void;
};

export const MobileFiltersSidebar: FC<MobileFiltersSidebarProps> = ({
  onClose,
}) => {
  return (
    <>
      <OverlayMask doPreventBodyScrolling isPrevalent opacity={0.6} />

      {/* Sidebar filters */}
      <div
        style={{ maxWidth: 'min(80%, 344px)' }}
        className="fixed top-0 right-0 bg-mono-0 dark:bg-mono-190 z-20 px-9 py-6 w-full min-w-[220px] h-screen overflow-y-auto"
      >
        <Filters hasCloseButton onClose={onClose} />
      </div>
    </>
  );
};
