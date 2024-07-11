import {
  ModalContent as ModalContentCmp,
  ModalDescription,
  ModalTitle,
} from '@webb-tools/webb-ui-components/components/Modal';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

const ModalContent = ({
  children,
  className,
  title,
  description,
  ...props
}: ComponentProps<typeof ModalContentCmp> & {
  title: string;
  description: string;
}) => {
  return (
    <ModalContentCmp
      isCenter
      {...props}
      className={twMerge(
        'w-full h-full p-4 max-w-xl max-h-[var(--restake-modal-max-height)]',
        className,
      )}
    >
      <ModalTitle className="sr-only">{title}</ModalTitle>

      <ModalDescription className="sr-only">{description}</ModalDescription>

      {children}
    </ModalContentCmp>
  );
};

export default ModalContent;
