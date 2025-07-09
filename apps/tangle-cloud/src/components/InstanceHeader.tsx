import { GithubFill } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  title?: string;
  githubPath?: string | null;
  creator?: string;
};

const InstanceHeader: FC<Props> = ({ title, githubPath, creator }) => {
  return (
    <div
      className={twMerge(
        'flex gap-3 p-6 w-full border-2',
        'border-mono-80 dark:border-mono-170',
        'bg-gradient-to-b from-blue-120/10 to-blue-100/10 dark:from-blue-120/20 dark:to-blue-100/20',
        'before:bg-gradient-to-b before:from-mono-80/40 before:to-mono-80/20 dark:before:from-mono-170/50 dark:before:to-mono-170/30',
      )}
    >
      <div className="flex flex-col gap-2">
        <Typography variant="h5" className="flex items-center gap-2 text-mono-200 dark:text-mono-0">
          {title}{' '}
          {githubPath && (
            <GithubFill size="lg" target="_blank" href={githubPath} />
          )}
        </Typography>

        <Typography variant="body1" className="text-mono-140 dark:text-mono-100">
          {creator}
        </Typography>
      </div>
    </div>
  );
};

export default InstanceHeader;
