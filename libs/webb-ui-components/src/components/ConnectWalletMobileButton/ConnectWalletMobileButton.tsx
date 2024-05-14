import { forwardRef } from 'react';
import { Typography } from '../../typography/index.js';
import { Button, ButtonProps } from '../buttons/index.js';
import {
  BottomDialog,
  BottomDialogTrigger,
  BottomDialogPortal,
} from '../BottomDialog/index.js';
import { ConnectWalletMobileButtonProps } from './types.js';

export const ConnectWalletMobileButton = forwardRef<
  HTMLDivElement,
  ConnectWalletMobileButtonProps
>(
  (
    {
      className,
      title = 'Switch to Desktop',
      children,
      extraActionButtons = [],
      ...props
    },
    ref
  ) => {
    const defaultActionButtonsProps: Array<ButtonProps> = [
      {
        children: 'Continue on Desktop',
        isFullWidth: true,
      },
    ];

    const actionButtonsProps = [
      ...defaultActionButtonsProps,
      ...extraActionButtons,
    ];

    return (
      <BottomDialog ref={ref}>
        <BottomDialogTrigger>
          <Button {...props} className={className}>
            Connect
          </Button>
        </BottomDialogTrigger>
        <BottomDialogPortal
          title={title}
          actionButtonsProps={actionButtonsProps}
          className="w-full"
        >
          {children ? (
            children
          ) : (
            <div className="flex flex-col gap-4">
              <Typography variant="body1">
                For the best experience, we recommend using our desktop
                interface.
              </Typography>
            </div>
          )}
        </BottomDialogPortal>
      </BottomDialog>
    );
  }
);
