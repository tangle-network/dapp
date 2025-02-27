import { Children, createElement, type FC } from 'react';
import TangleCloudCard from '../../components/TangleCloudCard';
import { Chip, ListItem, Typography } from '@tangle-network/ui-components';
import { CLOUD_INSTRUCTIONS } from '../../constants/cloudInstruction';
import { twMerge } from 'tailwind-merge';
import { Link } from '@tangle-network/ui-components/components/Link';

export const InstructionCard: FC = () => {
  return (
    <TangleCloudCard>
      <ul className="h-full flex flex-col gap-6">
        {Children.toArray(
          CLOUD_INSTRUCTIONS.map((instruction) => (
            <ListItem
              className={twMerge('w-full px-0', 'opacity-100 p-0')}
              isDisabled
            >
              <div className="flex gap-4 w-full flex-wrap xs:flex-nowrap justify-center xs:justify-start">
                <Chip
                  color="dark-grey"
                  className="!dark:bg-mono-0/[20%] min-w-14 h-14 flex items-center justify-center"
                >
                  {createElement(instruction.icon, {
                    className: instruction.className,
                  })}
                </Chip>
                <div className="gap-1 flex flex-col items-center xs:items-start">
                  <Link
                    href={instruction.to}
                    className="text-blue-50 text-center xs:text-left"
                    target={instruction.external ? '_blank' : '_self'}
                    rel={instruction.external ? 'noopener noreferrer' : ''}
                  >
                    {instruction.title}
                  </Link>
                  <Typography
                    variant="body1"
                    className="!text-mono-100 text-center xs:text-left"
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
