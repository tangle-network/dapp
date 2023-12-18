import { Card, Typography, Chip } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import Image from 'next/image';
import assert from 'assert';
import { StarIcon } from '@radix-ui/react-icons';
import { ProjectItem } from './types';

export const ProjectCard: FC<ProjectItem> = (props) => {
  const MAX_CONTRIBUTOR_AVATAR_URLS = 4;

  assert(props.circuitCount >= 0, 'Circuit count should never be negative.');

  return (
    <Card className="flex flex-row gap-3 space-y-0 py-5 px-6">
      <div>
        {/* TODO: Likely there's a way to get Tailwind-dependent width & height values for the Image component. */}
        <Image
          alt={`${props.repositoryOwner}'s avatar`}
          src={props.ownerAvatarUrl}
          width={48}
          height={48}
          className="rounded-full bg-mono-200 shadow-md"
        />
      </div>

      <div className="w-full">
        <div className="flex">
          <Typography variant="body1" fw="bold" className="dark:text-mono-0">
            {props.repositoryOwner}/{props.repositoryName}
          </Typography>

          <div className="flex items-center ml-auto">
            <StarIcon className="mr-1 dark:text-mono-100" />{' '}
            {props.stargazerCount}
          </div>
        </div>

        <Typography
          variant="body2"
          fw="normal"
          className="dark:text-mono-100"
          component="p"
        >
          {props.description}
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
              {props.contributorAvatarUrls
                .slice(0, MAX_CONTRIBUTOR_AVATAR_URLS)
                .map((avatarUrl, index) => (
                  // TODO: Likely there's a way to get Tailwind-dependent width & height values for the Image component.
                  <Image
                    key={index}
                    alt="Contributor avatar"
                    src={avatarUrl}
                    width={24}
                    height={24}
                    className="rounded-full bg-mono-200 border-[1px] border-mono-140 shadow-xl w-6 h-6"
                  />
                ))}

              {props.contributorAvatarUrls.length >
                MAX_CONTRIBUTOR_AVATAR_URLS && (
                <Chip color="grey" className="bg-mono-140 shadow-md px-2">
                  +
                  {props.contributorAvatarUrls.length -
                    MAX_CONTRIBUTOR_AVATAR_URLS}
                </Chip>
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

            <Chip color="grey" className="bg-mono-140 px-2">
              {props.circuitCount}
            </Chip>
          </div>
        </div>
      </div>
    </Card>
  );
};
