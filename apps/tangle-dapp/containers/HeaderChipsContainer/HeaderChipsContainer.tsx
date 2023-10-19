import { BlockIcon } from '@webb-tools/icons';
import { HeaderChip } from '../../components';
import { getEra, getSession } from '../../data';

export const HeaderChipsContainer = () => {
  return (
    <div className="items-center hidden gap-2 md:flex lg:gap-4">
      <HeaderChip Icon={BlockIcon} label="ERA" dataFetcher={getEra} />

      <HeaderChip Icon={BlockIcon} label="Session" dataFetcher={getSession} />
    </div>
  );
};
