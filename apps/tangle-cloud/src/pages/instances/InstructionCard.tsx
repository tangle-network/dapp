import { ComponentProps, createElement, type FC } from 'react';
import { Link as RouterLink } from 'react-router';
import TangleCloudCard from '../../components/TangleCloudCard';
import { CLOUD_INSTRUCTIONS } from '../../constants/cloudInstruction';
import { ArrowRightUp } from '@tangle-network/icons';
import { Badge } from '@tangle-network/sandbox-ui/primitives';

type InstructionCardProps = {
  rootProps?: ComponentProps<typeof TangleCloudCard>;
};

export const InstructionCard: FC<InstructionCardProps> = ({ rootProps }) => {
  return (
    <TangleCloudCard {...rootProps}>
      <div className="flex flex-col gap-4">
        <div>
          <Badge variant="outline">Next steps</Badge>
          <h2 className="mt-3 font-display font-bold text-foreground text-xl tracking-tight">
            Quick Actions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {CLOUD_INSTRUCTIONS.map((instruction) => {
            const content = (
              <div className="group flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-muted">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors duration-200 group-hover:border-primary/40">
                  {createElement(instruction.icon, {
                    className: 'h-6 w-6 fill-primary',
                  })}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="font-display font-bold text-foreground text-sm transition-colors duration-200 group-hover:text-primary">
                    {instruction.title}
                  </h3>
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {instruction.description}
                  </p>
                </div>

                {instruction.external && (
                  <ArrowRightUp className="h-5 w-5 shrink-0 fill-muted-foreground transition-colors duration-200 group-hover:fill-primary" />
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
