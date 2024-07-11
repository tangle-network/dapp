import { Transition, TransitionRootProps } from '@headlessui/react';
import type { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = Partial<TransitionRootProps<'div'>> &
  Pick<TransitionRootProps<'div'>, 'show'> &
  Omit<TransitionRootProps<'div'>, 'as'> & {
    className?: string;
  };

export default function SlideAnimation({
  children,
  className,
  enter,
  enterFrom,
  enterTo,
  leave,
  leaveFrom,
  leaveTo,
  ...restProps
}: PropsWithChildren<Props>) {
  return (
    <Transition
      {...restProps}
      as="div"
      className={twMerge(
        'h-full w-full',
        'transition-[top,_opacity] duration-150 opacity-100 top-0',
        'data-[closed]:opacity-0 data-[closed]:top-[250px]',
        className,
      )}
    >
      {children}
    </Transition>
  );
}
