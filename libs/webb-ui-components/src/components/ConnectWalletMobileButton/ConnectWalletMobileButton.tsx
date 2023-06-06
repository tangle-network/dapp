import { forwardRef } from 'react';

import { Typography } from '../../typography';
import { Button, ButtonProps } from '../Button';
import {
  BottomDialog,
  BottomDialogTrigger,
  BottomDialogPortal,
} from '../BottomDialog';
import { ConnectWalletMobileButtonProps } from './types';
import { BRIDGE_URL, BRIDGE_DOCS_URL } from '../../constants';

const actionButtonsProps: Array<ButtonProps> = [
  {
    children: 'Continue on Desktop',
    isFullWidth: true,
  },
  {
    children: 'Learn more',
    variant: 'secondary',
    isFullWidth: true,
    href: BRIDGE_DOCS_URL,
  },
];

export const ConnectWalletMobileButton = forwardRef<
  HTMLDivElement,
  ConnectWalletMobileButtonProps
>(({ className, ...props }, ref) => {
  return (
    <BottomDialog className="lg:hidden" ref={ref}>
      <BottomDialogTrigger>
        <Button {...props} className={className}>
          Connect Wallet
        </Button>
      </BottomDialogTrigger>
      <BottomDialogPortal
        title="Try Hubble on Desktop"
        actionButtonsProps={actionButtonsProps}
        className="w-full"
      >
        <div className="flex flex-col gap-4">
          <Typography variant="body1">
            A complete mobile experience for Hubble Bridge is in the works. For
            now, enjoy all features on a desktop device.
          </Typography>
          <Typography variant="body1">
            Visit the link on desktop below to start transacting privately!
          </Typography>
          <Typography
            variant="body1"
            className="text-[#3D7BCE] dark:text-[#81B3F6]"
          >
            {BRIDGE_URL}
          </Typography>
        </div>
      </BottomDialogPortal>
    </BottomDialog>
  );
});
