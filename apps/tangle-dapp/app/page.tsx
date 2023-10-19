import { Typography, Chip } from '@webb-tools/webb-ui-components';
import { BlockIcon, Spinner } from '@webb-tools/icons';
import { getEra, getSession } from '../data';

export default async function Index() {
  const era = await getEra();
  const session = await getSession();

  return (
    <div className="flex items-center justify-between">
      <Typography variant="h4" fw="bold">
        Staking Overview
      </Typography>

      <div className="flex items-center space-x-4">
        <Chip color="blue">
          <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
          {era ? `ERA: ${era}` : <Spinner size="md" />}
        </Chip>

        <Chip color="blue">
          <BlockIcon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
          {session ? `Session: ${session}` : <Spinner size="md" />}
        </Chip>
      </div>
    </div>
  );
}
