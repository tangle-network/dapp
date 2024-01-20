import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { IconWithTooltip } from '@webb-tools/webb-ui-components/components/IconWithTooltip';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { useCopyable } from '@webb-tools/webb-ui-components/hooks/useCopyable';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import type { ComponentProps, ElementRef } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import useHiddenValue from '../hooks/useHiddenValue';

type Props = {
  keyValue: string;
  iconTooltipContent: string;
  label?: string;
  fontWeight?: ComponentProps<typeof KeyValueWithButton>['valueFontWeight'];
};

const IdentityWithAvatar = forwardRef<
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

  const [isHiddenValue] = useHiddenValue();
  const copyableResult = useCopyable();

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
        shortenFn={isHiddenValue ? shortenString : undefined}
        isDisabledTooltip={isHiddenValue}
        copyProps={isHiddenValue ? copyableResult : undefined}
        valueFontWeight={fontWeight}
        size="sm"
        labelVariant="body1"
        valueVariant="body1"
        onCopyButtonClick={
          isHiddenValue ? () => copyableResult.copy(keyValue) : undefined
        }
        keyValue={
          isHiddenValue
            ? Array.from({ length: 130 })
                .map(() => '*')
                .join('')
            : keyValue
        }
      />
    </div>
  );
});

IdentityWithAvatar.displayName = IdentityWithAvatar.name;

export default IdentityWithAvatar;
