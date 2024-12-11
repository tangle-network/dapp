import { BlockIcon } from '@webb-tools/icons';

import { HeaderChip } from '../../components';

const HeaderChipsContainer = () => {
  return (
    <div className="items-center hidden gap-2 md:flex lg:gap-4">
      <HeaderChip Icon={BlockIcon} label="ERA" />

      <HeaderChip Icon={BlockIcon} label="Session" />
    </div>
  );
};

export default HeaderChipsContainer;
