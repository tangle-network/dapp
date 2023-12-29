import type { FC } from 'react';
import cx from 'classnames';
import { Chip, Typography } from '@webb-tools/webb-ui-components';
import { TwitterFill, DiscordFill, GlobalLine } from '@webb-tools/icons';
import type { IconBase } from '@webb-tools/icons/types';

import GitHubIconWithLink from '../../components/GitHubIconWithLink';
import { getProjectHeaderContainerData } from '../../server';

interface ProjectHeaderContainerProps {
  className?: string;
}

export default async function ProjectHeaderContainer({
  className,
}: ProjectHeaderContainerProps) {
  const { name, owner, tags, githubUrl, twitterUrl, websiteUrl, discordUrl } =
    await getProjectHeaderContainerData();

  return (
    <div
      className={cx('dark:bg-mono-180 p-6 space-y-8 rounded-2xl', className)}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          {/* Name */}
          <div className="flex items-center gap-1">
            <Typography variant="h4" fw="bold" className="!text-mono-0">
              {name}
            </Typography>
            <GitHubIconWithLink href={githubUrl} size="lg" />
          </div>

          {/* Owner */}
          <Typography variant="h5" className="!text-mono-120">
            @{owner}
          </Typography>
        </div>

        {/* Socials */}
        <div className="flex items-center gap-2">
          {twitterUrl && <SocialChip href={twitterUrl} Icon={TwitterFill} />}
          {websiteUrl && <SocialChip href={websiteUrl} Icon={GlobalLine} />}
          {discordUrl && <SocialChip href={discordUrl} Icon={DiscordFill} />}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          // TODO: Replace this with chip component (Yuri's working on that)
          <Chip
            key={tag}
            color="grey"
            className="bg-mono-140 py-1 px-2 !text-mono-0"
          >
            {tag}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/** @internal */
const SocialChip: FC<{
  href: string;
  Icon: (props: IconBase) => JSX.Element;
}> = ({ href, Icon }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {/* TODO: Replace this with chip component (Yuri's working on that) */}
      <Chip
        color="grey"
        className="bg-mono-140 hover:bg-mono-120 py-1 px-2 !text-mono-0"
      >
        <Icon className="!fill-mono-0" />
      </Chip>
    </a>
  );
};
