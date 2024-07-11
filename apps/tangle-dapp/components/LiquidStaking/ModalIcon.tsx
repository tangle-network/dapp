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
        // TODO: Any close-enough-looking TailwindCSS color alternative? Currently taking this specific hex color from the design, since it's not a standard TailwindCSS color.
        'rounded-2xl p-5 dark:bg-[#21262C] w-min',
        commonVariant === ModalIconCommonVariant.SUCCESS && 'dark:bg-green-120',
        className,
      )}
    >
      <Icon
        className={twMerge(
          // TODO: Any close-enough-looking TailwindCSS color alternative? Currently taking this specific hex color from the design, since it's not a standard TailwindCSS color.
          'w-8 h-8 dark:fill-[#A0AEC0]',
          commonVariant === ModalIconCommonVariant.SUCCESS &&
            'dark:fill-green-40',
          iconClassName,
        )}
      />
    </div>
  );
};

export default ModalIcon;
