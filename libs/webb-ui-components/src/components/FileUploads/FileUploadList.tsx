import { Typography } from '../../typography/Typography/index.js';
import { forwardRef } from 'react';
import { ScrollArea } from '../ScrollArea/index.js';
import { FileUploadListProps } from './types.js';
import { twMerge } from 'tailwind-merge';

export const FileUploadList = forwardRef<HTMLUListElement, FileUploadListProps>(
  ({ children, className, title, ...props }, ref) => {
    return (
      <ScrollArea
        className={twMerge(
          'max-w-[420px] w-full h-full max-h-[200px] overflow-y-auto',
          className
        )}
      >
        <ul className="space-y-2" {...props} ref={ref}>
          {title && (
            <Typography
              component="p"
              variant="utility"
              className="text-base normal-case"
            >
              {title}
            </Typography>
          )}
          {children}
        </ul>
      </ScrollArea>
    );
  }
);
