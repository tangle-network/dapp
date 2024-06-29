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
      className={twMerge('h-full w-full', className)}
      enter={twMerge('transition-[top,_opacity] duration-150', enter)}
      enterFrom={twMerge('opacity-0 top-[250px]', enterFrom)}
      enterTo={twMerge('opacity-100 top-0', enterTo)}
      leave={twMerge('transition-[top,_opacity] duration-150', leave)}
      leaveFrom={twMerge('opacity-100 top-0', leaveFrom)}
      leaveTo={twMerge('opacity-0 top-[250px]', leaveTo)}
    >
      {children}
    </Transition>
  );
}
