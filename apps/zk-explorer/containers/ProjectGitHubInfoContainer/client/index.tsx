'use client';

import {
  ActivityIcon,
  BookOpenLineIcon,
  BranchesIcon,
  EyeLineIcon,
  ScalesIcon,
  StarLineIcon,
  TagIcon,
} from '@webb-tools/icons';
import type { IconBase } from '@webb-tools/icons/types';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils/getRoundedAmountString';
import cx from 'classnames';
import Image from 'next/image';
import { useMemo, useState, type FC } from 'react';

import SmallChip from '../../../components/SmallChip';
import { PROJECT_DETAIL_CONTAINER_ID } from '../../../constants';

import GitHubAvatar from '../../../components/GitHubAvatar';
import type { ProjectGitHubInfoContainerDataType } from '../../../server';

const CONTROLLER_MARGIN_LEFT = 20;

const ProjectGitHubInfoClient: FC<{
  data: ProjectGitHubInfoContainerDataType;
  className?: string;
}> = ({ data, className }) => {
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
  } = data;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const controllerLeftPosition = useMemo(() => {
    if (!isCollapsed) return -30;
    const container = document.getElementById(PROJECT_DETAIL_CONTAINER_ID);
    const containerWidth = container?.offsetWidth as number;
    const { innerWidth: windowWidth } = window;
    const paddingWidth = (windowWidth - containerWidth) / 2;
    return -(paddingWidth - CONTROLLER_MARGIN_LEFT);
  }, [isCollapsed]);

  return (
    <div
      className={cx(
        'relative bg-mono-0 dark:bg-mono-180 rounded-2xl lg:mr-6',
        'transition-all duration-150 ease-in-out',
        className,
        {
          'lg:w-0 lg:!m-0': isCollapsed,
        }
      )}
    >
      {/* Main Content */}
      <div
        className={cx('lg:w-[270px] p-4 md:p-6 space-y-6', {
          'lg:!w-0 lg:!p-0 lg:overflow-hidden': isCollapsed,
        })}
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
          <Typography
            variant="body1"
            fw="bold"
            className="!text-mono-200 dark:!text-mono-0"
          >
            About
          </Typography>
          <Typography variant="body1">{description}</Typography>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <SmallChip key={tag}>{tag}</SmallChip>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-2">
          <BasicInfoItem
            Icon={BookOpenLineIcon}
            label="Readme"
            url={readmeUrl}
          />
          <BasicInfoItem
            Icon={ScalesIcon}
            label={license.name}
            url={license.url}
          />
          <BasicInfoItem
            Icon={ActivityIcon}
            label="Activity"
            url={activityUrl}
          />
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
            <Typography
              variant="body1"
              fw="bold"
              className="!text-mono-200 dark:!text-mono-0"
            >
              Releases
            </Typography>
            <SmallChip className="py-0.5">{releasesCount}</SmallChip>
          </div>
          <div className="flex items-center gap-2">
            <TagIcon className="fill-green-70 dark:!fill-green-50" />
            {/* Latest Release */}
            <a
              href={latestReleaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dark:text- hover:text-blue-70 dark:hover:!text-blue-50"
            >
              <Typography variant="body2" className="!text-inherit">
                {latestRelease}
              </Typography>
            </a>
            <div className="border border-green-90 rounded-3xl py-0.5 px-2">
              <Typography
                variant="body4"
                className="text-green-70 dark:!text-green-50"
              >
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
            <Typography
              variant="body1"
              fw="bold"
              className="!text-mono-200 dark:!text-mono-0"
            >
              Contributors
            </Typography>
            <SmallChip className="py-0.5">{contributorsCount}</SmallChip>
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
          <Typography
            variant="body1"
            fw="bold"
            className="!text-mono-200 dark:!text-mono-0"
          >
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

      {/* Collapse Controller */}
      <div
        className={cx(
          'cursor-pointer absolute top-[50%] translate-y-[-50%] hidden lg:block',
          { 'lg:rotate-180': isCollapsed }
        )}
        style={{
          left: `${controllerLeftPosition}px`,
        }}
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
      >
        <ArrowController />
      </div>
    </div>
  );
};

export default ProjectGitHubInfoClient;

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
        <Icon className="!fill-mono-160 dark:!fill-mono-80 group-hover:!fill-blue-70 dark:group-hover:!fill-blue-50" />
        <Typography
          variant="body2"
          className="!text-mono-160 dark:!text-mono-80 group-hover:!text-blue-70 dark:group-hover:!text-blue-50"
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
      <Typography variant="body3" className="!text-mono-200 dark:!text-mono-0">
        {name}
      </Typography>
      <Typography variant="body3" className="!text-mono-120">
        {percentage}%
      </Typography>
    </div>
  );
};

/** @internal */
const ArrowController: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="48"
      viewBox="0 0 25 48"
      className="fill-mono-0 opacity-20 hover:opacity-50"
    >
      <path d="M11.379 2.15226C12.0679 0.829607 13.4354 0 14.9267 0H18.1478C21.0921 0 23.0274 3.07333 21.7551 5.72848L13.8282 22.2715C13.3046 23.3644 13.3046 24.6357 13.8282 25.7285L21.7551 42.2715C23.0274 44.9267 21.0921 48 18.1478 48H14.9267C13.4354 48 12.0679 47.1704 11.379 45.8477L0.962364 25.8477C0.359239 24.6897 0.359239 23.3103 0.962363 22.1523L11.379 2.15226Z" />
    </svg>
  );
};
