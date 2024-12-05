import { IconBase } from '@webb-tools/icons/types';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export enum ModalIconCommonVariant {
  SUCCESS,
}

export type ModalIconProps = {
  Icon: (props: IconBase) => ReactNode;
  className?: string;
  iconClassName?: string;
  commonVariant?: ModalIconCommonVariant;
};

const ModalIcon: FC<ModalIconProps> = ({
  Icon,
  className,
  iconClassName,
  commonVariant,
}) => {
  return (
    <div
      className={twMerge(
        'rounded-2xl p-5 dark:bg-mono-170 w-min',
        commonVariant === ModalIconCommonVariant.SUCCESS && 'dark:bg-green-120',
        className,
      )}
    >
      <Icon
        className={twMerge(
          'w-8 h-8 dark:fill-mono-100',
          commonVariant === ModalIconCommonVariant.SUCCESS &&
            'dark:fill-green-40',
          iconClassName,
        )}
      />
    </div>
  );
};

export default ModalIcon;
