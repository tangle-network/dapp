'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import cx from 'classnames';
import { FC, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { ScrollAreaProps } from './types';

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ScrollAreaPrimitive.Root
        {...props}
        className={twMerge('overflow-hidden', className)}
        ref={ref}
      >
        <ScrollAreaPrimitive.Viewport className="w-full h-full">
          {children}
        </ScrollAreaPrimitive.Viewport>

        <Scrollbar orientation="vertical">
          <Thumb />
        </Scrollbar>
        <Scrollbar orientation="horizontal">
          <Thumb />
        </Scrollbar>
        <Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);

const Scrollbar = forwardRef<
  HTMLDivElement,
  ScrollAreaPrimitive.ScrollAreaScrollbarProps
>(({ children, className, ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    {...props}
    className={twMerge(
      cx(
        'flex select-none touch-none p-0.5 w-2.5',
        'bg-transparent',
        'data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5',
      ),
      className,
    )}
    ref={ref}
  >
    {children}
  </ScrollAreaPrimitive.Scrollbar>
));

const Thumb: FC = forwardRef<
  HTMLDivElement,
  ScrollAreaPrimitive.ScrollAreaThumbProps
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Thumb
    {...props}
    className={twMerge(
      cx(
        'flex-1 bg-mono-60 dark:bg-mono-120 rounded-full',
        'relative before:content-[""] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2',
        'before:w-full before:h-full',
      ),
      className,
    )}
    ref={ref}
  />
));

const Corner = forwardRef<
  HTMLDivElement,
  ScrollAreaPrimitive.ScrollAreaCornerProps
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Corner
    {...props}
    className={twMerge('bg-transparent', className)}
    ref={ref}
  />
));
