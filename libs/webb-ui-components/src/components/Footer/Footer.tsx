import Link from 'next/link';
import { FC, forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import * as constants from '../../constants';
import type { ExternalLink, Link as ILink } from '../../types';
import { Typography } from '../../typography/Typography';
import { Divider } from '../Divider';
import { Logo } from '../Logo';
import { Socials } from '../Socials';
import { FooterProps } from './types';

/**
 * The statistic `Footer` for `Layout` container
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
  ({ className, isNext, isMinimal, ...props }, ref) => {
    return (
      <footer
        {...props}
        className={twMerge(
          'flex flex-col space-y-4 max-w-[1160px] mx-auto py-[72px]',
          className
        )}
        ref={ref}
      >
        {isMinimal ? (
          // Minimal Footer
          <>
            <Socials
              iconPlacement="end"
              iconClassName="text-mono-100 hover:text-mono-200 dark:hover:text-mono-40"
            />

            <div className="flex flex-col md:flex-row items-end gap-3 justify-between">
              <Typography variant="body2" className="!text-mono-100">
                © 2023 Webb Technologies, Inc. All rights reserved.
              </Typography>
              <div className="flex flex-[1] align-items justify-end gap-6">
                {constants.bottomLinks.map(({ name, ...link }) => (
                  <a key={name} {...link} className="group">
                    <Typography
                      variant="body2"
                      className="!text-mono-100 underline"
                    >
                      {name}
                    </Typography>
                  </a>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Normal Footer
          <div className="mx-auto w-[360px] md:w-[768px] lg:w-[1160px] px-2">
            <div className="flex justify-between pb-6 flex-wrap gap-6 md:gap-0">
              {isNext ? (
                <Link className="block" href={constants.logoConfig.path}>
                  <Logo />
                </Link>
              ) : (
                <NavLink className="block" to={constants.logoConfig.path}>
                  <Logo />
                </NavLink>
              )}

              {Object.keys(constants.footerNavs).map((key, idx) => {
                return (
                  <FooterNavItem
                    key={`${key}-${idx}`}
                    header={key}
                    links={constants.footerNavs[key]}
                  />
                );
              })}
            </div>

            <Divider />

            {/** Social platforms */}
            <Socials
              iconPlacement="end"
              iconClassName="text-mono-100 hover:text-mono-200 dark:hover:text-mono-40 pt-4 px-2 mb-6"
            />

            <div className="flex justify-between px-2">
              <Typography variant="body2" className="!text-mono-100">
                Apache 2.0
              </Typography>

              <div className="flex items-center space-x-12">
                {constants.bottomLinks.map(({ name, ...link }) => (
                  <a key={name} {...link} className="group">
                    <Typography
                      variant="body2"
                      className="!text-mono-100 group-hover:underline"
                    >
                      {name}
                    </Typography>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

const FooterNavItem: FC<{
  header: string;
  links: Array<ILink | ExternalLink>;
}> = ({ header, links }) => (
  <div className="flex flex-col space-y-4">
    <Typography
      component="span"
      variant="body1"
      className="!text-mono-100 inline-block capitalize"
      fw="bold"
    >
      {header}
    </Typography>

    <ul className="flex flex-col space-y-1">
      {links.map((link, idx) => {
        const { name, ...restLink } = link;

        return (
          <li key={`${name}${idx}`}>
            {'path' in restLink ? (
              <NavLink to={restLink.path}>
                <Typography
                  component="span"
                  variant="body2"
                  className="!text-mono-100 group-hover:underline capitalize"
                >
                  {name}
                </Typography>
              </NavLink>
            ) : (
              <a {...restLink} className="group">
                <Typography
                  component="span"
                  variant="body2"
                  className="!text-mono-100 group-hover:underline capitalize"
                >
                  {name}
                </Typography>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);
