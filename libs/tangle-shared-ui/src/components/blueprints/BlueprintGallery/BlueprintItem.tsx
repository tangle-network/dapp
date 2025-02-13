import { isEthereumAddress } from '@polkadot/util-crypto';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { isSubstrateAddress } from '@tangle-network/ui-components/utils/isSubstrateAddress';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import BoostedChip from '../BoostedChip';
import { BlueprintItemProps } from './types';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';

const BlueprintItem: FC<BlueprintItemProps> = ({
  name,
  author,
  imgUrl,
  description,
  restakersCount,
  operatorsCount,
  tvl,
  isBoosted,
  renderImage,
  isSelected,
  onSelectedChange,
}) => {
  return (
    <div
      className={twMerge(
        'h-[364px] overflow-hidden rounded-xl flex flex-col cursor-pointer group',
        'border border-mono-0 dark:border-mono-170',
        isBoosted && 'border-t-0',
      )}
    >
      {isBoosted && (
        <div
          className={twMerge(
            'h-2 bg-purple-60',
            'bg-[linear-gradient(to_right,hsla(230,64%,52%,0.8)0%,hsla(230,87%,74%,0.8)40%,hsla(242,100%,93%,0.8)100%)]',
            'dark:bg-[linear-gradient(to_right,hsla(231,49%,13%,0.8)0%,hsla(242,67%,55%,0.8)40%,hsla(242,93%,65%,0.8)100%)]',
          )}
        />
      )}
      <div
        className={twMerge(
          'relative flex-1 flex flex-col justify-between py-3 px-6 overflow-hidden',
          'bg-[linear-gradient(180deg,rgba(184,196,255,0.20)0%,rgba(236,239,255,0.20)100%),linear-gradient(180deg,rgba(255,255,255,0.50)0%,rgba(255,255,255,0.30)100%)]',
          'dark:bg-[linear-gradient(180deg,rgba(17,22,50,0.20)0%,rgba(21,37,117,0.20)100%),linear-gradient(180deg,rgba(43,47,64,0.50)0%,rgba(43,47,64,0.30)100%)]',
          'hover:before:absolute hover:before:inset-0 hover:before:bg-cover hover:before:bg-no-repeat hover:before:opacity-50 hover:before:pointer-events-none',
          "hover:before:bg-[url('/static/assets/blueprints/grid-bg.png')] dark:hover:before:bg-[url('/static/assets/blueprints/grid-bg-dark.png')]",
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 py-2 border-b border-mono-60 dark:border-mono-170">
            {imgUrl && renderImage(imgUrl)}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Typography
                    variant="h5"
                    className="truncate text-mono-180 dark:text-mono-20 group-hover:text-mono-200 dark:group-hover:text-mono-0"
                  >
                    {name}
                  </Typography>
                </div>

                {typeof isSelected === 'boolean' &&
                typeof onSelectedChange === 'function' ? (
                  <CheckBox
                    isChecked={isSelected}
                    onChange={onSelectedChange}
                    labelProps={{
                      onClick: (event) => event.stopPropagation(),
                    }}
                  />
                ) : (
                  isBoosted && <BoostedChip />
                )}
              </div>

              <Typography
                variant="body2"
                className="line-clamp-1 text-mono-120 dark:text-mono-100"
              >
                {/* Author can be name or address */}
                {isEthereumAddress(author)
                  ? shortenHex(author)
                  : isSubstrateAddress(author)
                    ? shortenString(author)
                    : author}
              </Typography>
            </div>
          </div>

          <Typography
            variant="body2"
            className="line-clamp-[7] text-mono-120 dark:text-mono-100 group-hover:text-mono-200 dark:group-hover:text-mono-0"
          >
            {description}
          </Typography>
        </div>

        <div className="flex w-full gap-1">
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              Restakers
            </Typography>
            <Typography variant="h5">
              {restakersCount ?? EMPTY_VALUE_PLACEHOLDER}
            </Typography>
          </div>
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              Operators
            </Typography>
            <Typography variant="h5">
              {operatorsCount ?? EMPTY_VALUE_PLACEHOLDER}
            </Typography>
          </div>
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              TVL
            </Typography>
            <Typography variant="h5">
              {tvl ?? EMPTY_VALUE_PLACEHOLDER}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintItem;
