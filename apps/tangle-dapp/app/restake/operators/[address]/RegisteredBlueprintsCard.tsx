'use client';

import { ExternalLinkLine, GithubFill } from '@webb-tools/icons';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import type { EventFor } from '@webb-tools/webb-ui-components/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Link from 'next/link';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../../../components/GlassCard/GlassCard';
import { PagePath } from '../../../../types';

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
  {
    id: '3',
    name: 'LIT Protocol fork of ZCash Frost',
    avatarUrl:
      'https://pbs.twimg.com/profile_images/1746972470840836096/Xzg3jx6V_400x400.png',
    githubUrl: 'https://github.com/webb-tools/tangle',
  },
  {
    id: '4',
    name: 'DFNS',
    avatarUrl:
      'https://pbs.twimg.com/profile_images/1746972470840836096/Xzg3jx6V_400x400.png',
  },
];

// Use `twMerge` here for intellisense
const bgDarkClassName = twMerge(
  'dark:[background:_linear-gradient(180deg,_rgba(12,_10,_56,_0.20)_0%,_rgba(30,_25,_138,_0.20)_100%),_linear-gradient(180deg,_rgba(43,_47,_64,_0.70)_0%,_rgba(43,_47,_64,_0.42)_100%)]',
  'dark:[background-blend-mode:_normal,_plus-lighter,_normal]',
);

const bgClassName = twMerge(
  '[background:_linear-gradient(180deg,_rgba(236,_239,_255,_0.20)_0%,_rgba(129,_149,_246,_0.20)_100%),_linear-gradient(180deg,_rgba(255,_255,_255,_0.70)_0%,_rgba(255,_255,_255,_0.00)_100%)]',
);

const RegisteredBlueprintsCard: FC<Props> = ({ className, ...props }) => {
  const isEmpty = false;

  return (
    <GlassCard
      {...props}
      className={twMerge(bgClassName, bgDarkClassName, 'gap-3', className)}
    >
      <Typography variant="h4" fw="bold">
        Registered Blueprints
      </Typography>

      <ScrollArea className="flex items-center justify-center flex-grow overflow-auto">
        {isEmpty ? (
          <Typography
            variant="body2"
            ta="center"
            className="text-mono-100 dark:text-mono-120"
          >
            This Operator has not registered any Blueprints.
          </Typography>
        ) : (
          <ul className="w-full h-full px-2">
            {blueprints.map(({ id, avatarUrl, name, githubUrl }) => {
              return (
                <li
                  key={id}
                  className="group px-1 py-2 hover:bg-[#3A3E53]/10 dark:hover:bg-mono-0/5 rounded-lg"
                >
                  <Link
                    className="flex items-center justify-between gap-4"
                    href={`${PagePath.BLUEPRINTS}/${name}`}
                    target="_blank"
                  >
                    <p className="flex items-center flex-grow gap-2">
                      <Avatar src={avatarUrl} size="lg" />

                      <Typography
                        variant="h5"
                        fw="bold"
                        className="text-mono-200 dark:text-mono-0"
                      >
                        {name}
                      </Typography>

                      <ExternalLinkLine className="invisible fill-mono-200 dark:fill-mono-0 group-hover:visible" />
                    </p>

                    {githubUrl && (
                      <a
                        onClick={handleLinkClick}
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubFill size="lg" />
                      </a>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </GlassCard>
  );
};

export default RegisteredBlueprintsCard;

const handleLinkClick = (event: EventFor<'a', 'onClick'>) => {
  event.stopPropagation();
};
