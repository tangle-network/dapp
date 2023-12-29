import { type FC } from 'react';
import Image from 'next/image';
import cx from 'classnames';
import { Button, Chip, Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils/getRoundedAmountString';
import {
  BookOpenLineIcon,
  ScalesIcon,
  ActivityIcon,
  EyeLineIcon,
  StarLineIcon,
  BranchesIcon,
  TagIcon,
} from '@webb-tools/icons';
import type { IconBase } from '@webb-tools/icons/types';

import { GitHubAvatar } from '../../components/GitHubAvatar';
import { getProjectGitHubInfoContainerData } from '../../server';

interface ProjectGitHubInfoContainerProps {
  className?: string;
}

export default async function ProjectGitHubInfoContainer({
  className,
}: ProjectGitHubInfoContainerProps) {
  const {
    fullName,
    avatarUrl,
    description,
    tags,
    readmeUrl,
    license,
    activityUrl,
    starsCount,
    starsUrl,
    watchersCount,
    watchersUrl,
    forksCount,
    forksUrl,
    releasesCount,
    latestRelease,
    latestReleaseUrl,
    releasesUrl,
    contributorsCount,
    topContributors,
    contributorsUrl,
    languagesInfo,
  } = await getProjectGitHubInfoContainerData();

  return (
    <div
      className={cx('dark:bg-mono-180 p-6 space-y-6 rounded-2xl', className)}
    >
      {/* Image */}
      <div className="hidden lg:block">
        <Image
          src={avatarUrl}
          width={200}
          height={200}
          alt={fullName}
          className="rounded-full mx-auto"
        />
      </div>

      <div className="space-y-4">
        {/* Description */}
        <Typography variant="body1" fw="bold" className="!text-mono-0">
          About
        </Typography>
        <Typography variant="body1">{description}</Typography>

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

      {/* Basic Info */}
      <div className="space-y-2">
        <BasicInfoItem Icon={BookOpenLineIcon} label="Readme" url={readmeUrl} />
        <BasicInfoItem
          Icon={ScalesIcon}
          label={license.name}
          url={license.url}
        />
        <BasicInfoItem Icon={ActivityIcon} label="Activity" url={activityUrl} />
        <BasicInfoItem
          Icon={EyeLineIcon}
          label={`${getRoundedAmountString(watchersCount)} watching`}
          url={watchersUrl}
        />
        <BasicInfoItem
          Icon={StarLineIcon}
          label={`${getRoundedAmountString(starsCount)} stars`}
          url={starsUrl}
        />
        <BasicInfoItem
          Icon={BranchesIcon}
          label={`${getRoundedAmountString(forksCount)} forks`}
          url={forksUrl}
        />
      </div>

      {/* Releases */}
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          <Typography variant="body1" fw="bold" className="!text-mono-0">
            Releases
          </Typography>
          <Chip color="grey" className="bg-mono-140 px-2 py-0.5">
            {releasesCount}
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <TagIcon className="!fill-green-50" />
          {/* Latest Release */}
          <a
            href={latestReleaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:!text-blue-50"
          >
            <Typography variant="body2" className="!text-inherit">
              {latestRelease}
            </Typography>
          </a>
          <div className="border border-green-90 rounded-3xl py-0.5 px-2">
            <Typography variant="body4" className="!text-green-50">
              Latest
            </Typography>
          </div>
        </div>
        {releasesCount > 1 && (
          <Button
            href={releasesUrl}
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            className="!lowercase"
          >{`+${releasesCount - 1} releases`}</Button>
        )}
      </div>

      {/* Contributor */}
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          <Typography variant="body1" fw="bold" className="!text-mono-0">
            Contributors
          </Typography>
          <Chip color="grey" className="bg-mono-140 px-2 py-0.5">
            {contributorsCount}
          </Chip>
        </div>

        {/* Image */}
        <div className="flex flex-wrap gap-2">
          {topContributors.map((contributor, idx) => (
            <GitHubAvatar
              key={idx}
              name={contributor.name}
              avatarUrl={contributor.avatarUrl}
              profileUrl={contributor.profileUrl}
            />
          ))}
        </div>

        {releasesCount > 1 && (
          <Button
            href={contributorsUrl}
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            className="!capitalize"
          >
            View all
          </Button>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <Typography variant="body1" fw="bold" className="!text-mono-0">
          Languages
        </Typography>
        <div className="space-y-2">
          {/* Languages bar */}
          <div className="h-2 rounded-md overflow-hidden flex">
            {Object.values(languagesInfo).map((language, idx) => {
              return (
                <span
                  style={{
                    backgroundColor: language.color,
                    width: `${language.percentage}%`,
                  }}
                  className="ml-0.5 first:ml-0"
                  key={idx}
                />
              );
            })}
          </div>

          {/* Languages Percentage Info */}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {Object.keys(languagesInfo).map((language) => (
              <LanguagePercentageInfoItem
                key={language}
                name={language}
                color={languagesInfo[language].color}
                percentage={languagesInfo[language].percentage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** @internal */
const BasicInfoItem: FC<{
  Icon: (props: IconBase) => JSX.Element;
  label: string;
  url?: string;
}> = ({ Icon, label, url }) => {
  if (url) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={url}
        className="flex items-center gap-2 group"
      >
        <Icon className="!fill-mono-80 group-hover:!fill-blue-50" />
        <Typography
          variant="body2"
          className="!text-mono-80 group-hover:!text-blue-50"
        >
          {label}
        </Typography>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className="!fill-mono-80" />
      <Typography variant="body2" className="!text-mono-80">
        {label}
      </Typography>
    </div>
  );
};

/** @internal */
const LanguagePercentageInfoItem: FC<{
  name: string;
  color: string;
  percentage: number;
}> = ({ name, color, percentage }) => {
  return (
    <div className="flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="17"
        viewBox="0 0 16 17"
        fill="none"
      >
        <path
          d="M8 4.5C9.06087 4.5 10.0783 4.92143 10.8284 5.67157C11.5786 6.42172 12 7.43913 12 8.5C12 9.56087 11.5786 10.5783 10.8284 11.3284C10.0783 12.0786 9.06087 12.5 8 12.5C6.93913 12.5 5.92172 12.0786 5.17157 11.3284C4.42143 10.5783 4 9.56087 4 8.5C4 7.43913 4.42143 6.42172 5.17157 5.67157C5.92172 4.92143 6.93913 4.5 8 4.5Z"
          fill={color}
        />
      </svg>
      <Typography variant="body3" className="!text-mono-0">
        {name}
      </Typography>
      <Typography variant="body3" className="!text-mono-120">
        {percentage}%
      </Typography>
    </div>
  );
};
