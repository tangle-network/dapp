import { DiscordFill, GlobalLine, TwitterFill } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import GitHubIconWithLink from '../../components/GitHubIconWithLink';
import { RunCircuitServiceModalTrigger } from '../../components/RunCircuitServiceModalTrigger';
import { SmallChip } from '../../components/SmallChip';
import SocialChip from '../../components/SocialChip';
import { MOCK_CIRCUIT_FILE_PATH } from '../../constants/mock';
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
      className={cx(
        'bg-mono-0 dark:bg-mono-180 p-4 md:p-6 space-y-8 rounded-2xl',
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          {/* Name */}
          <div className="flex items-center gap-1">
            <Typography
              variant="h4"
              fw="bold"
              className="!text-mono-200 dark:!text-mono-0"
            >
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
          {twitterUrl && (
            <SocialChip
              title="View X profile"
              href={twitterUrl}
              Icon={TwitterFill}
            />
          )}

          {websiteUrl && (
            <SocialChip
              title="View website"
              href={websiteUrl}
              Icon={GlobalLine}
            />
          )}

          {discordUrl && (
            <SocialChip
              title="Join Discord server"
              href={discordUrl}
              Icon={DiscordFill}
            />
          )}
        </div>
      </div>

      <div className="flex flex-row justify-between gap-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <SmallChip key={tag}>{tag}</SmallChip>
          ))}
        </div>

        {/* TODO: Need to provide appropriate props corresponding to the currently active & selected circuit file's file path (if it happens to be a circuit file). Will likely need to pass this down from the parent as a prop. */}
        <RunCircuitServiceModalTrigger
          owner={owner}
          repositoryName={name}
          circuitFilePath={MOCK_CIRCUIT_FILE_PATH}
        />
      </div>
    </div>
  );
}
