'use client';

import { type FC, useState } from 'react';
import { EyeLineIcon, EyeClosedLine } from '@webb-tools/icons';

import { Typography } from '../../typography';
import { CopyWithTooltip } from '../../components/CopyWithTooltip/CopyWithTooltip';

const SpendNoteInput: FC<{ note: string }> = ({ note }) => {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="flex items-center justify-between gap-1">
      <Typography
        variant="h5"
        fw="bold"
        className="block text-clip whitespace-nowrap overflow-hidden !text-mono-100"
      >
        {hidden ? '*'.repeat(40) : note}
      </Typography>
      <div className="flex items-center gap-1">
        {hidden ? (
          <EyeClosedLine
            size="lg"
            onClick={() => {
              setHidden(false);
            }}
            className="!fill-mono-100"
          />
        ) : (
          <EyeLineIcon
            size="lg"
            onClick={() => {
              setHidden(true);
            }}
            className="!fill-mono-100"
          />
        )}
        <CopyWithTooltip
          textToCopy={note}
          isButton={false}
          iconSize="lg"
          iconClassName="!fill-mono-100"
        />
      </div>
    </div>
  );
};

export default SpendNoteInput;
