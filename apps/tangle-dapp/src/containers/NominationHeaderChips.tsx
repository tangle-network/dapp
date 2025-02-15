import { BlockIcon } from '@tangle-network/icons';

import { HeaderChip } from '../components';

const NominationHeaderChips = () => {
  return (
    <div className="items-center hidden gap-2 md:flex lg:gap-4">
      <HeaderChip Icon={BlockIcon} label="ERA" />

      <HeaderChip Icon={BlockIcon} label="Session" />
    </div>
  );
};

export default NominationHeaderChips;
