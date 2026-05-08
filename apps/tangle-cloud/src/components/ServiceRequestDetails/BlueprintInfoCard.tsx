import { FC } from 'react';
import { isAddress } from 'viem';
import { twMerge } from 'tailwind-merge';
import { Text } from '../sandbox/SandboxUi';

const EMPTY_VALUE_PLACEHOLDER = '-';

type Props = {
  name: string;
  author: string;
  description: string;
  instancesCount: number;
  operatorsCount: number;
};

const shortenValue = (value: string, chars = 6) =>
  value.length <= chars * 2 + 3
    ? value
    : `${value.slice(0, chars)}...${value.slice(-chars)}`;

const BlueprintInfoCard: FC<Props> = ({
  name,
  author,
  description,
  instancesCount,
  operatorsCount,
}) => {
  const formattedAuthor = isAddress(author, { strict: false })
    ? shortenValue(author)
    : author.length > 24
      ? shortenValue(author)
      : author;

  return (
    <div
      className={twMerge('rounded-xl overflow-hidden', 'border border-border')}
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
          <Text variant="h4" className="text-foreground">
            {name}
          </Text>

          <Text variant="body1" className="text-muted-foreground">
            {formattedAuthor}
          </Text>
        </div>

        <Text variant="body2" className="relative text-foreground">
          {description}
        </Text>

        <div className="relative flex w-full gap-1 pt-4">
          <div className="flex-1 space-y-2">
            <Text variant="body2" className="text-muted-foreground">
              Instances
            </Text>

            <Text variant="h5">
              {instancesCount ?? EMPTY_VALUE_PLACEHOLDER}
            </Text>
          </div>

          <div className="flex-1 space-y-2">
            <Text variant="body2" className="text-muted-foreground">
              Operators
            </Text>

            <Text variant="h5">
              {operatorsCount ?? EMPTY_VALUE_PLACEHOLDER}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintInfoCard;
