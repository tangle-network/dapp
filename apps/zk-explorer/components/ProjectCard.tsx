import { StarIcon } from '@radix-ui/react-icons';
import { Avatar, Card, Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';
import SmallChip from './SmallChip';

export type ProjectItem = {
  ownerAvatarUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  description: string;
  stargazerCount: number;
  circuitCount: number;
  contributorAvatarUrls: string[];
};

const ProjectCard: FC<ProjectItem> = ({
  ownerAvatarUrl,
  repositoryOwner,
  repositoryName,
  description,
  stargazerCount,
  circuitCount,
  contributorAvatarUrls,
}) => {
  const MAX_CONTRIBUTOR_AVATAR_URLS = 4;

  assert(circuitCount >= 0, 'Circuit count should never be negative.');

  return (
    <Card className="flex flex-row gap-3 space-y-0 py-5 px-6 shadow-sm dark:!bg-transparent dark:bg-glass-dark dark:hover:!bg-mono-180">
      <div>
        <Avatar
          size="lg"
          src={ownerAvatarUrl}
          alt={`${repositoryOwner}'s avatar`}
          className="shadow-md"
        />
      </div>

      <div className="w-full">
        <div className="flex">
          <Typography variant="body1" fw="bold" className="dark:text-mono-0">
            {repositoryOwner}/{repositoryName}
          </Typography>

          <div className="flex items-center ml-auto">
            <StarIcon className="mr-1 dark:text-mono-100" /> {stargazerCount}
          </div>
        </div>

        <Typography
          variant="body2"
          fw="normal"
          className="dark:text-mono-100"
          component="p"
        >
          {description}
        </Typography>

        <div className="flex flex-row w-full mt-2">
          <div className="flex flex-col items-start gap-2 w-full">
            <Typography
              variant="body2"
              fw="normal"
              className="dark:text-mono-00"
            >
              Contributors
            </Typography>

            <div className="flex items-center space-x-[-7px]">
              {contributorAvatarUrls
                .slice(0, MAX_CONTRIBUTOR_AVATAR_URLS)
                .map((avatarUrl, index) => (
                  <Avatar
                    key={index}
                    src={avatarUrl}
                    alt={`${repositoryName} contributor's avatar ${index}`}
                    className="shadow-md"
                  />
                ))}

              {contributorAvatarUrls.length > MAX_CONTRIBUTOR_AVATAR_URLS && (
                <SmallChip>
                  +{contributorAvatarUrls.length - MAX_CONTRIBUTOR_AVATAR_URLS}
                </SmallChip>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Typography
              variant="body2"
              fw="normal"
              className="dark:text-mono-00"
            >
              Circuits
            </Typography>

            <SmallChip>{circuitCount}</SmallChip>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
