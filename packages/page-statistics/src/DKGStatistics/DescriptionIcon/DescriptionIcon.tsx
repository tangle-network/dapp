import { IconButton, Popover } from '@mui/material';
import { InformationIcon } from '@webb-dapp/ui-components/assets/InformationIcon';
import React, { Fragment, useState } from 'react';

import { DescriptionText } from './styled';

export const DescriptionIcon: React.FC<{ description: string }> = ({ description }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Fragment>
      <IconButton
        size='small'
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup='true'
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <InformationIcon width={12} height={12} />
      </IconButton>
      <Popover
        id='mouse-over-popover'
        style={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <DescriptionText variant='caption'>{description}</DescriptionText>
      </Popover>
    </Fragment>
  );
};
