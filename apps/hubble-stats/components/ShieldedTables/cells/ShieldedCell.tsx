import { FC } from 'react';
import { Typography, useDarkMode } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

interface ShieldedCellProps {
  title: string;
  address: string;
  icon?: JSX.Element;
}

export const ShieldedCell: FC<ShieldedCellProps> = ({
  title,
  address,
  icon,
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon ?? null}

      <div className="flex flex-col">
        <Typography variant="body1" fw="bold" className="text-mono-140">
          {title}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography variant="body1" className="text-mono-140">
            {shortenHex(address, 4)}
          </Typography>

          {/* TODO: update href */}
          <a href="#" target="_blank" rel="noreferrer">
            <ExternalLinkIcon className="fill-mono-140" />
          </a>
        </div>
      </div>
    </div>
  );
};
