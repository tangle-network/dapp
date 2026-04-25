import { GithubFill } from '@tangle-network/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Text } from './sandbox/SandboxUi';

type Props = {
  title?: string;
  githubPath?: string | null;
  creator?: string;
};

const InstanceHeader: FC<Props> = ({ title, githubPath, creator }) => {
  return (
    <div
      className={twMerge(
        'flex gap-3 p-6 w-full rounded-xl border',
        'border-border bg-card',
      )}
    >
      <div className="flex flex-col gap-2">
        <Text variant="h5" className="flex items-center gap-2 text-foreground">
          {title}{' '}
          {githubPath && (
            <GithubFill size="lg" target="_blank" href={githubPath} />
          )}
        </Text>

        <Text variant="body1" className="text-muted-foreground">
          {creator}
        </Text>
      </div>
    </div>
  );
};

export default InstanceHeader;
