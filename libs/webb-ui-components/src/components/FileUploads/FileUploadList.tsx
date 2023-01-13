import { Typography } from '../../typography/Typography';
import { forwardRef } from 'react';
import { ScrollArea } from '../ScrollArea';
import { FileUploadListProps } from './types';
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
              className="normal-case text-base"
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
