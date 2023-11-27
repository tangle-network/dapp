import { forwardRef } from 'react';
import { Typography } from '../../typography';
import { Button, ButtonProps } from '../buttons';
import {
  BottomDialog,
  BottomDialogTrigger,
  BottomDialogPortal,
} from '../BottomDialog';
import { ConnectWalletMobileButtonProps } from './types';

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
