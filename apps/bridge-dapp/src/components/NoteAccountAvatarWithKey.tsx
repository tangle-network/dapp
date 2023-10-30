import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { IconWithTooltip } from '@webb-tools/webb-ui-components/components/IconWithTooltip';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ComponentProps, ElementRef } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  keyValue: string;
  iconTooltipContent: string;
  label?: string;
  fontWeight?: ComponentProps<typeof KeyValueWithButton>['valueFontWeight'];
};

const NoteAccountAvatarWithKey = forwardRef<
  ElementRef<'div'>,
  PropsOf<'div'> & Props
>((props, ref) => {
  const {
    keyValue,
    label,
    iconTooltipContent,
    className,
    fontWeight,
    ...divProps
  } = props;

  return (
    <div
      {...divProps}
      className={twMerge(className, 'flex items-center gap-2')}
      ref={ref}
    >
      <IconWithTooltip
        icon={<Avatar value={keyValue} theme="ethereum" />}
        content={iconTooltipContent}
      />

      <KeyValueWithButton
        className="mt-0.5"
        label={label}
        isHiddenLabel={!label}
        keyValue={keyValue}
        valueFontWeight={fontWeight}
        size="sm"
        labelVariant="body1"
        valueVariant="body1"
      />
    </div>
  );
});

export default NoteAccountAvatarWithKey;
