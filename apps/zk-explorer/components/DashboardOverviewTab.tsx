'use client';

import { GithubFill, GlobalLine, TwitterFill } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { Button, Card, Typography } from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { ComponentType, FC, useMemo } from 'react';
import { useRequireAuth } from '../hooks/useAuth';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { formatTimestamp } from '../utils';
import { LargeSquareAvatar } from './LargeSquareAvatar';
import { SmallChip } from './SmallChip';

export const DashboardOverviewTab: FC = () => {
  const {
    activatedCircuitCount,
    createdAt,
    githubUsername,
    website,
    twitterHandle,
    shortBio,
  } = useRequireAuth();

  const creationTimestampString = useMemo(
    () => formatTimestamp(createdAt),
    [createdAt]
  );

  const breakpoint = useTailwindBreakpoint();

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6 flex flex-col md:flex-row rounded-2xl space-y-0 items-start md:gap-6">
        {breakpoint < TailwindBreakpoint.MD && (
          <div className="mb-6 md:mb-0">
            <LargeSquareAvatar />
          </div>
        )}

        <div className="flex flex-col justify-center gap-1">
          <Typography variant="body2" fw="normal">
            Activated Circuits
          </Typography>

          <Typography variant="body1" fw="normal" className="dark:text-mono-0">
            {activatedCircuitCount === 0 ? '-' : activatedCircuitCount}
          </Typography>
        </div>

        <Divider />

        <div className="flex flex-col justify-center gap-1">
          <Typography variant="body2" fw="normal">
            Member Since
          </Typography>

          <Typography variant="body1" fw="normal" className="dark:text-mono-0">
            {creationTimestampString}
          </Typography>
        </div>

        <Divider />

        <div className="flex flex-col justify-center gap-1">
          <Typography variant="body2" fw="normal">
            Links
          </Typography>

          <div className="flex gap-2">
            <SocialChip
              title="View GitHub profile"
              href={`https://github.com/${githubUsername}`}
              Logo={GithubFill}
            />

            {twitterHandle !== undefined && (
              <SocialChip
                title="View X profile"
                href={`https://twitter.com/${twitterHandle}`}
                Logo={TwitterFill}
              />
            )}

            {website !== undefined && (
              <SocialChip
                title="View website"
                href={website}
                Logo={GlobalLine}
              />
            )}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col justify-center gap-1">
          <Typography variant="body2" fw="normal">
            Short Bio
          </Typography>

          <Typography
            variant="body1"
            fw="normal"
            className="max-w-[400px] dark:text-mono-0"
          >
            {shortBio === undefined ? '-' : shortBio}
          </Typography>
        </div>

        {breakpoint >= TailwindBreakpoint.MD && (
          <div className="ml-auto lg:self-center">
            <LargeSquareAvatar />
          </div>
        )}
      </Card>

      <Card className="p-6 flex gap-4 rounded-2xl space-y-0">
        <Typography variant="h5" fw="bold">
          Proof Generations
        </Typography>

        <div className="flex flex-col items-center gap-3 py-12 mx-auto">
          <Typography variant="h5" fw="bold" className="text-center">
            🔍
            <br /> Coming Soon!
          </Typography>

          <Typography
            variant="body2"
            fw="normal"
            className="text-center max-w-[712px]"
          >
            Get ready to unlock the full potential of your ZK circuits! Our ZK
            services are on the horizon, designed to seamlessly create and
            manage zero-knowledge proofs with unparalleled efficiency.
          </Typography>

          <Button variant="secondary" href={WEBB_DOCS_URL}>
            Learn More
          </Button>
        </div>
      </Card>
    </div>
  );
};

/** @internal */
const Divider: FC = () => {
  return (
    <div className="inline-block py-3 lg:py-0 lg:px-7 lg:self-center">
      <div className="dark:border-mono-160 border-t w-full lg:w-auto lg:border-r lg:border-t-0 lg:min-h-[57px] lg:h-full" />
    </div>
  );
};

type SocialChipProps = {
  href: string;
  title: string;
  Logo: ComponentType<IconBase>;
};

/** @internal */
const SocialChip: FC<SocialChipProps> = ({ Logo, href, title }) => {
  return (
    <Link target="_blank" title={title} href={href}>
      <SmallChip color="grey">
        <Logo className="fill-mono-0" size="md" />
      </SmallChip>
    </Link>
  );
};
