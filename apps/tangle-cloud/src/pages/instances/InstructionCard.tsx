import { Children, ComponentProps, createElement, type FC } from 'react';
import TangleCloudCard from '../../components/TangleCloudCard';
import { Chip, ListItem, Typography } from '@tangle-network/ui-components';
import { CLOUD_INSTRUCTIONS } from '../../constants/cloudInstruction';
import { twMerge } from 'tailwind-merge';
import { Link } from '@tangle-network/ui-components/components/Link';

type InstructionCardProps = {
  rootProps?: ComponentProps<typeof TangleCloudCard>;
};

export const InstructionCard: FC<InstructionCardProps> = ({ rootProps }) => {
  return (
    <TangleCloudCard {...rootProps}>
      <ul className="h-full flex flex-col justify-between gap-6">
        {Children.toArray(
          CLOUD_INSTRUCTIONS.map((instruction) => (
            <ListItem
              className={twMerge('w-full px-0', 'opacity-100 p-0')}
              isDisabled
            >
              <div className="flex gap-5 w-full flex-wrap xs:flex-nowrap justify-center xs:justify-start items-start">
                <Chip
                  color="dark-grey"
                  className="bg-blue-10 dark:bg-blue-120 border border-blue-30 dark:border-blue-100 min-w-16 h-16 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {createElement(instruction.icon, {
                    className: 'h-7 w-7 fill-blue-70 dark:fill-blue-40',
                  })}
                </Chip>
                <div className="gap-2 flex flex-col items-center xs:items-start flex-1">
                  <Link
                    href={instruction.to}
                    target={instruction.external ? '_blank' : '_self'}
                    rel={instruction.external ? 'noopener noreferrer' : ''}
                    className="hover:no-underline group"
                  >
                    <Typography
                      variant="h5"
                      fw="bold"
                      className="text-blue-70 dark:text-blue-40 group-hover:text-blue-80 dark:group-hover:text-blue-30 transition-colors duration-200 leading-tight"
                    >
                      {instruction.title}
                    </Typography>
                  </Link>
                  <Typography
                    variant="body2"
                    className="text-mono-140 dark:text-mono-80 text-center xs:text-left leading-relaxed"
                  >
                    {instruction.description}
                  </Typography>
                </div>
              </div>
            </ListItem>
          )),
        )}
      </ul>
    </TangleCloudCard>
  );
};

InstructionCard.displayName = 'InstructionCard';
