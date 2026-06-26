import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { isSubstrateAddress } from '@tangle-network/ui-components/utils/isSubstrateAddress';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import BoostedChip from '../BoostedChip';
import { BlueprintItemProps } from './types';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';

const CATEGORY_GRADIENTS: Record<string, string> = {
  Inference: 'from-indigo-500/30 to-purple-600/20',
  Data: 'from-emerald-500/30 to-teal-600/20',
  Agents: 'from-amber-500/30 to-orange-600/20',
  Trading: 'from-blue-500/30 to-cyan-600/20',
  Training: 'from-rose-500/30 to-pink-600/20',
  Other: 'from-purple-500/30 to-violet-600/20',
};

const getCategoryGradient = (category: string | null): string =>
  CATEGORY_GRADIENTS[category ?? 'Other'] ?? CATEGORY_GRADIENTS.Other;

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
    <div
      onClick={onClick}
      className={twMerge(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl',
        'border border-mono-60 dark:border-mono-170',
        'bg-mono-0 dark:bg-mono-180',
        'transition-all duration-200',
        'hover:border-purple-40/40 hover:shadow-[0_8px_40px_rgba(67,62,217,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
        'hover:-translate-y-0.5',
      )}
    >
      {isBoosted && (
        <div className="h-1 w-full bg-gradient-to-r from-purple-40 via-purple-30 to-blue-40" />
      )}

      {/* Visual banner */}
      <div
        className={twMerge(
          'relative h-16 overflow-hidden bg-gradient-to-br',
          getCategoryGradient(category),
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />

        {/* Category badge */}
        {category && (
          <span className="absolute right-3 top-3 rounded-full border border-mono-0/20 bg-mono-0/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-mono-0/80 backdrop-blur-sm dark:border-mono-0/10 dark:bg-mono-0/5 dark:text-mono-0/70">
            {category}
          </span>
        )}

        {/* Floating icon — overlaps banner and body */}
        <div className="absolute -bottom-4 left-5">
          {renderImage(imgUrl ?? '')}
        </div>

        {/* Selection checkbox */}
        {typeof isSelected === 'boolean' &&
          typeof onSelectedChange === 'function' && (
            <div
              className="absolute right-3 bottom-3"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckBox isChecked={isSelected} onChange={onSelectedChange} />
            </div>
          )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-6">
        {/* Name + author */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Typography
              variant="h4"
              className="truncate text-mono-200 dark:text-mono-0"
            >
              {name}
            </Typography>
            {isBoosted && typeof isSelected !== 'boolean' && <BoostedChip />}
          </div>
          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-100"
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
          className="line-clamp-2 min-h-[2.6rem] text-mono-140 dark:text-mono-80"
        >
          {description ?? 'No description available.'}
        </Typography>

        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 px-2.5 py-1.5">
            <Typography
              variant="body2"
              className="font-bold text-mono-200 dark:text-mono-0"
            >
              {instancesCount ?? 0}
            </Typography>
            <span className="text-[11px] text-mono-100 dark:text-mono-80">
              services
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 px-2.5 py-1.5">
            <Typography
              variant="body2"
              className="font-bold text-mono-200 dark:text-mono-0"
            >
              {operatorsCount ?? 0}
            </Typography>
            <span className="text-[11px] text-mono-100 dark:text-mono-80">
              operators
            </span>
          </div>
        </div>

        {/* Actions */}
        {action !== undefined && (
          <div
            className="relative z-10 mt-auto flex w-full gap-2 pt-1"
            onClick={(event) => event.stopPropagation()}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueprintItem;
