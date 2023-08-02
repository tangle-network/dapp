import { FC } from 'react';
import { Chip } from '@webb-tools/webb-ui-components';
import { BlockIcon } from '@webb-tools/icons';

interface OverviewChipsContainerProps {
  tvlValue?: number;
  volumeValue?: number;
}

const OverviewChipsContainer: FC<OverviewChipsContainerProps> = ({
  tvlValue,
  volumeValue,
}) => {
  return (
    <div className="hidden md:flex items-center gap-4">
      <Chip color="blue">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        TVL: {tvlValue ? `${tvlValue}` : ' - '}
      </Chip>

      <Chip color="blue">
        <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        Volume: {volumeValue ? `${volumeValue}` : ' - '}
      </Chip>
    </div>
  );
};

export default OverviewChipsContainer;
