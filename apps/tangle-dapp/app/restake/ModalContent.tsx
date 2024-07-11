import {
  ModalContent as ModalContentCmp,
  ModalTitle,
} from '@webb-tools/webb-ui-components/components/Modal';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

const ModalContent = ({
  children,
  className,
  title,
  ...props
}: ComponentProps<typeof ModalContentCmp> & { title: string }) => {
  return (
    <ModalContentCmp
      isCenter
      {...props}
      className={twMerge(
        'w-full h-full p-4 max-h-[var(--restake-modal-max-height)]',
        className,
      )}
    >
      <ModalTitle className="sr-only">{title}</ModalTitle>

      {children}
    </ModalContentCmp>
  );
};

export default ModalContent;
