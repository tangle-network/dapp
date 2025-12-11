import { ComponentProps, createElement, type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import TangleCloudCard from '../../components/TangleCloudCard';
import { Typography } from '@tangle-network/ui-components';
import { CLOUD_INSTRUCTIONS } from '../../constants/cloudInstruction';
import { ArrowRightUp } from '@tangle-network/icons';

type InstructionCardProps = {
  rootProps?: ComponentProps<typeof TangleCloudCard>;
};

export const InstructionCard: FC<InstructionCardProps> = ({ rootProps }) => {
  return (
    <TangleCloudCard {...rootProps}>
      <div className="flex flex-col gap-4">
        <Typography
          variant="h5"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          Quick Actions
        </Typography>

        <div className="flex flex-col gap-3">
          {CLOUD_INSTRUCTIONS.map((instruction) => {
            const content = (
              <div className="group flex items-center gap-4 p-4 rounded-lg border border-mono-60 dark:border-mono-160 bg-mono-0 dark:bg-mono-180 hover:border-blue-50 dark:hover:border-blue-90 hover:bg-blue-10/50 dark:hover:bg-blue-120/20 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-10 dark:bg-blue-120 border border-blue-30 dark:border-blue-100 group-hover:bg-blue-20 dark:group-hover:bg-blue-110 transition-colors duration-200 shrink-0">
                  {createElement(instruction.icon, {
                    className: 'w-6 h-6 fill-blue-70 dark:fill-blue-40',
                  })}
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="text-mono-200 dark:text-mono-0 group-hover:text-blue-70 dark:group-hover:text-blue-40 transition-colors duration-200"
                  >
                    {instruction.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-mono-120 dark:text-mono-100 line-clamp-2"
                  >
                    {instruction.description}
                  </Typography>
                </div>

                {instruction.external && (
                  <ArrowRightUp className="w-5 h-5 fill-mono-100 dark:fill-mono-120 group-hover:fill-blue-70 dark:group-hover:fill-blue-40 transition-colors duration-200 shrink-0" />
                )}
              </div>
            );

            if (instruction.external) {
              return (
                <a
                  key={instruction.title}
                  href={instruction.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:no-underline"
                >
                  {content}
                </a>
              );
            }

            return (
              <RouterLink
                key={instruction.title}
                to={instruction.to}
                className="no-underline hover:no-underline"
              >
                {content}
              </RouterLink>
            );
          })}
        </div>
      </div>
    </TangleCloudCard>
  );
};

InstructionCard.displayName = 'InstructionCard';
