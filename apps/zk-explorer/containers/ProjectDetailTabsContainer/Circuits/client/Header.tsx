import { type FC } from 'react';
import {
  Chip,
  Typography,
  SkeletonLoader,
} from '@webb-tools/webb-ui-components';
import { CheckLineIcon, ShieldedCheckLineIcon } from '@webb-tools/icons';

import GitHubIconWithLink from '../../../../components/GitHubIconWithLink';
import type { CircuitItemFileType } from '../../../../server';

interface HeaderProps {
  activeFile?: CircuitItemFileType;
}

const Header: FC<HeaderProps> = ({ activeFile }) => {
  if (!activeFile) {
    return (
      <div className="p-3 flex items-center justify-between border-b border-mono-180">
        <SkeletonLoader size="lg" />
      </div>
    );
  }

  const { fullPath, isTrustedSetup, gitHubUrl } = activeFile;

  return (
    <div className="p-3 flex items-center justify-between border-b border-mono-180">
      <div className="flex items-center gap-[6px]">
        {isTrustedSetup && <ShieldedCheckLineIcon className="!fill-green-50" />}
        <Typography variant="body2" className="!text-mono-0">
          {fullPath}
        </Typography>
        {gitHubUrl && <GitHubIconWithLink href={gitHubUrl} />}
      </div>

      <Chip color="blue" className="flex items-center gap-2">
        Trusted Setup
        <CheckLineIcon className="!fill-blue-30" />
      </Chip>
    </div>
  );
};

export default Header;
