import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { Close } from '@webb-tools/icons';

import { Button } from '../buttons/index.js';
import { Typography } from '../../typography/index.js';
import { BottomDialogPortalProps } from './types.js';

export const BottomDialogPortal = forwardRef<
  HTMLDivElement,
  BottomDialogPortalProps
>(
  (
    {
      children,
      title,
      actionButtonsProps,
      overlayProps,
      contentProps,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Dialog.Portal {...props}>
        <Dialog.Overlay
          {...overlayProps}
          className="fixed inset-0 bg-[rgba(0,0,0,0.1)] animate-[showDialogOverlay_150ms]"
        />
        <Dialog.Content
          {...contentProps}
          className={twMerge(
            '!bg-mono-0 dark:!bg-mono-160 rounded-xl fixed bottom-0',
            'animate-[bottomDialogSlideUp_400ms]',
            className
          )}
          ref={ref}
        >
          <Dialog.Title asChild>
            <div className="flex items-center justify-between pt-9 px-9">
              <Typography variant="h4" fw="bold">
                {title}
              </Typography>
              <Dialog.Close>
                <Close />
              </Dialog.Close>
            </div>
          </Dialog.Title>
          <Dialog.Description asChild>
            <div>
              <div className="p-9">{children}</div>
              {actionButtonsProps && (
                <div className="flex flex-col gap-2 py-6 px-9 border-t border-[#D3D8E2] dark:border-[#4E5463]">
                  {actionButtonsProps.map((buttonProps, idx) => (
                    <Dialog.Close asChild key={idx}>
                      <Button {...buttonProps} />
                    </Dialog.Close>
                  ))}
                </div>
              )}
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    );
  }
);
