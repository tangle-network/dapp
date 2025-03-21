import { GithubFill } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';

type Props = {
  title: string;
  githubPath?: string;
  creator: string;
};

const InstanceHeader: FC<Props> = ({ title, githubPath, creator }) => {
  return (
    <div className="flex gap-3 p-6 backdrop-blur-sm w-full dark:bg-blue-500">
      <div className="flex flex-col gap-2">
        <Typography variant="h5" className="flex items-center gap-2">
          {title} <GithubFill size="lg" />
        </Typography>

        <Typography variant="body1">{creator}</Typography>
      </div>
    </div>
  );
};

export default InstanceHeader;
