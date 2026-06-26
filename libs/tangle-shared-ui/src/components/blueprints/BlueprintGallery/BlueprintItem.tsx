import { Card, CardVariant } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { isSubstrateAddress } from '@tangle-network/ui-components/utils/isSubstrateAddress';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import BoostedChip from '../BoostedChip';
import { BlueprintItemProps } from './types';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';

const CATEGORY_ACCENTS: Record<string, string> = {
  Inference: 'from-indigo-500 to-purple-600',
  Data: 'from-emerald-500 to-teal-600',
  Agents: 'from-amber-500 to-orange-600',
  Trading: 'from-blue-500 to-cyan-600',
  Training: 'from-rose-500 to-pink-600',
  Other: 'from-purple-500 to-violet-600',
};

const getAccent = (category: string | null): string =>
  CATEGORY_ACCENTS[category ?? 'Other'] ?? CATEGORY_ACCENTS.Other;

const BlueprintItem: FC<Omit<BlueprintItemProps, 'id'>> = ({
  name,
  author,
  imgUrl,
  description,
  instancesCount,
  operatorsCount,
  isBoosted,
  category,
  renderImage,
  action,
  onClick,
  isSelected,
  onSelectedChange,
}) => {
  return (
    <Card
      variant={CardVariant.GLASS}
      withShadow
      onClick={onClick}
      className={twMerge(
        'group relative flex cursor-pointer flex-col gap-4 overflow-hidden p-5',
        'transition-all duration-200',
        'hover:border-purple-40/40 hover:-translate-y-0.5',
      )}
    >
      {/* Category accent strip */}
      <div
        className={twMerge(
          'absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r',
          getAccent(category),
        )}
      />

      {/* Boosted + selection */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {isBoosted && typeof isSelected !== 'boolean' && <BoostedChip />}
        {typeof isSelected === 'boolean' &&
          typeof onSelectedChange === 'function' && (
            <div onClick={(e) => e.stopPropagation()}>
              <CheckBox isChecked={isSelected} onChange={onSelectedChange} />
            </div>
          )}
      </div>

      {/* Icon */}
      <div className="pt-2">{renderImage(imgUrl ?? '')}</div>

      {/* Name + author */}
      <div className="space-y-0.5">
        <Typography
          variant="h5"
          fw="bold"
          className="truncate text-mono-200 dark:text-mono-0"
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          className="truncate text-mono-120 dark:text-mono-100"
        >
          {isEvmAddress(author)
            ? shortenHex(author)
            : isSubstrateAddress(author)
              ? shortenString(author)
              : author}
        </Typography>
      </div>

      {/* Description */}
      <Typography
        variant="body2"
        className="line-clamp-2 min-h-[2.5rem] text-mono-140 dark:text-mono-80"
      >
        {description ?? 'No description available.'}
      </Typography>

      {/* Stats */}
      <div className="mt-auto flex items-center gap-3 pt-1">
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          <span className="font-bold text-mono-200 dark:text-mono-0">
            {instancesCount ?? 0}
          </span>{' '}
          services
        </Typography>
        <span className="text-mono-60 dark:text-mono-140">·</span>
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          <span className="font-bold text-mono-200 dark:text-mono-0">
            {operatorsCount ?? 0}
          </span>{' '}
          operators
        </Typography>
        {category && (
          <>
            <span className="text-mono-60 dark:text-mono-140">·</span>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              {category}
            </Typography>
          </>
        )}
      </div>

      {/* Actions */}
      {action !== undefined && (
        <div
          className="relative z-10 flex w-full gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {action}
        </div>
      )}
    </Card>
  );
};

export default BlueprintItem;
