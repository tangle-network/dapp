import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../../../components/GlassCard/GlassCard';

interface Props extends Partial<ComponentProps<typeof GlassCard>> {}

const blueprints = [
  {
    id: '1',
    name: 'DKLS',
    avatarUrl: 'https://avatars.githubusercontent.com/u/76852793?s=96&v=4',
    githubUrl: 'https://github.com/webb-tools/tangle',
  },
  {
    id: '2',
    name: 'DFNS CGGMP21',
    avatarUrl:
      'https://pbs.twimg.com/profile_images/1746972470840836096/Xzg3jx6V_400x400.png',
    githubUrl: 'https://github.com/webb-tools/tangle',
  },
];

const RegisteredBlueprintsCard: FC<Props> = ({ className, ...props }) => {
  const isEmpty = true;

  return (
    <GlassCard {...props} className={twMerge('gap-3', className)}>
      <Typography variant="h4" fw="bold">
        Registered Blueprints
      </Typography>

      <div className="flex items-center justify-center flex-grow">
        {isEmpty ? (
          <Typography
            variant="body2"
            ta="center"
            className="text-mono-100 dark:text-mono-120"
          >
            This Operator has not registered any Blueprints.
          </Typography>
        ) : (
          <ScrollArea className="w-full h-full">
            <ul className="w-full h-full">
              {blueprints.map(({ id, avatarUrl }) => {
                return (
                  <li key={id}>
                    <p>
                      <Avatar src={avatarUrl} size="lg" />
                    </p>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </div>
    </GlassCard>
  );
};

export default RegisteredBlueprintsCard;
