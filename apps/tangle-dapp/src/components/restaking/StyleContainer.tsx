import { ComponentProps, forwardRef, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const StyleContainer = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ComponentProps<'div'>>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge('w-full md:max-w-lg mx-auto', className)}
    >
      {children}
    </div>
  );
});

StyleContainer.displayName = 'StyleContainer';

export default StyleContainer;
