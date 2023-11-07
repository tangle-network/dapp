import { forwardRef } from 'react';

import { Typography } from '../../typography';
import { Button, ButtonProps } from '../buttons';
import {
  BottomDialog,
  BottomDialogTrigger,
  BottomDialogPortal,
} from '../BottomDialog';
import { ConnectWalletMobileButtonProps } from './types';
import { BRIDGE_URL, WEBB_DOC_ROUTES_RECORD } from '../../constants';
import populateDocsUrl from '../../utils/populateDocsUrl';
import { ComputerIcon } from '@webb-tools/icons';

const actionButtonsProps: Array<ButtonProps> = [
  {
    children: 'Continue on Desktop',
    isFullWidth: true,
  },
];

const bridgeActionButtonsProps: Array<ButtonProps> = [
  ...actionButtonsProps,
  {
    children: 'Learn more',
    variant: 'secondary',
    isFullWidth: true,
    href: populateDocsUrl(
      WEBB_DOC_ROUTES_RECORD.projects['hubble-bridge'].overview
    ),
  },
];

const tangleActionButtonsProps: Array<ButtonProps> = [...actionButtonsProps];

export const ConnectWalletMobileButton = forwardRef<
  HTMLDivElement,
  ConnectWalletMobileButtonProps
>(({ className, appType = 'bridge-dapp', ...props }, ref) => {
  return (
    <BottomDialog ref={ref}>
      <BottomDialogTrigger>
        <Button {...props} className={className}>
          Connect
        </Button>
      </BottomDialogTrigger>
      <BottomDialogPortal
        title={
          appType === 'bridge-dapp'
            ? 'Try Hubble on Desktop'
            : 'Switch to Desktop'
        }
        actionButtonsProps={
          appType === 'bridge-dapp'
            ? bridgeActionButtonsProps
            : tangleActionButtonsProps
        }
        className="w-full"
      >
        <div className="flex flex-col gap-4">
          {appType === 'bridge-dapp' ? (
            <>
              <Typography variant="body1">
                A complete mobile experience for Hubble Bridge is in the works.
                For now, enjoy all features on a desktop device.
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
            </>
          ) : (
            <div className="flex flex-col justify-center items-center gap-4 py-9">
              <ComputerIcon size="xl" className="mx-auto" />
              <Typography variant="body1" className="text-center">
                For the best staking experience, we recommend using our desktop
                interface for full-feature interface and enhanced controls.
              </Typography>
            </div>
          )}
        </div>
      </BottomDialogPortal>
    </BottomDialog>
  );
});
