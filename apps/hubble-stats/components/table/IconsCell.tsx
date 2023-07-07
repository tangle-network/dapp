import { FC, useMemo } from 'react';
import cx from 'classnames';
import { TokenIcon, ChainIcon } from '@webb-tools/icons';

interface IconsCellProps {
  type: 'chains' | 'tokens';
  items: string[];
  className?: string;
  iconSize?: number;
}

const IconsCell: FC<IconsCellProps> = ({
  items,
  className,
  type,
  iconSize = 24,
}) => {
  const Icon = useMemo(
    () => (type === 'chains' ? ChainIcon : TokenIcon),
    [type]
  );

  // 3/4: the space not covered by the next icon
  const iconSizeNotCovered = useMemo(() => (3 / 4) * iconSize, [iconSize]);

  return (
    <div
      className={cx(
        'flex',
        { 'justify-center': type === 'tokens' },
        { 'justify-end': type === 'chains' },
        className
      )}
      style={{ height: iconSize }}
    >
      <div
        className="relative"
        style={{
          height: iconSize,
          width: (items.length - 1) * iconSizeNotCovered + iconSize,
        }}
      >
        {items.map((item, idx) => {
          return (
            <Icon
              key={idx}
              name={item}
              className="absolute top-0"
              style={{
                left: `${idx * iconSizeNotCovered}px`,
                width: iconSize,
                height: iconSize,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default IconsCell;
