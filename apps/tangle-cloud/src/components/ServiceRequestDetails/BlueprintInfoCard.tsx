import { FC } from 'react';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { isSubstrateAddress } from '@tangle-network/ui-components/utils/isSubstrateAddress';
import { twMerge } from 'tailwind-merge';

type Props = {
  name: string;
  author: string;
  description: string;
  instancesCount: number;
  operatorsCount: number;
};

const BlueprintInfoCard: FC<Props> = ({
  name,
  author,
  description,
  instancesCount,
  operatorsCount,
}) => {
  const formattedAuthor = isEthereumAddress(author)
    ? shortenHex(author)
    : isSubstrateAddress(author)
      ? shortenString(author)
      : author;

  return (
    <div
      className={twMerge(
        'rounded-xl overflow-hidden',
        'border border-mono-0 dark:border-mono-170',
      )}
    >
      <div
        className={twMerge(
          'relative flex flex-col gap-4 py-4 px-6',
          'bg-[linear-gradient(180deg,rgba(184,196,255,0.20)0%,rgba(236,239,255,0.20)100%),linear-gradient(180deg,rgba(255,255,255,0.50)0%,rgba(255,255,255,0.30)100%)]',
          'dark:bg-[linear-gradient(180deg,rgba(17,22,50,0.20)0%,rgba(21,37,117,0.20)100%),linear-gradient(180deg,rgba(43,47,64,0.50)0%,rgba(43,47,64,0.30)100%)]',
          'before:absolute before:inset-0 before:bg-cover before:bg-no-repeat before:opacity-50 before:pointer-events-none',
          "before:bg-[url('/static/assets/blueprints/grid-bg.png')] dark:before:bg-[url('/static/assets/blueprints/grid-bg-dark.png')]",
        )}
      >
        <div className="relative space-y-1">
          <Typography variant="h4" className="text-mono-180 dark:text-mono-20">
            {name}
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-100"
          >
            {formattedAuthor}
          </Typography>
        </div>

        <Typography
          variant="body2"
          className="relative text-mono-200 dark:text-mono-0"
        >
          {description}
        </Typography>

        <div className="relative flex w-full gap-1 pt-4">
          <div className="flex-1 space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              Instances
            </Typography>

            <Typography variant="h5">
              {instancesCount ?? EMPTY_VALUE_PLACEHOLDER}
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
        </div>
      </div>
    </div>
  );
};

export default BlueprintInfoCard;
