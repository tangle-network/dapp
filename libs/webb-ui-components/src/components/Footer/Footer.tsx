import React, { FC, forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import * as constants from '../../constants';
import { ExternalLink, Link, PropsOf } from '../../types';
import { Typography } from '../../typography/Typography';
import { Divider } from '../Divider';
import { Logo } from '../Logo';

/**
 * The statistic `Footer` for `Layout` container
 */
export const Footer = forwardRef<HTMLElement, PropsOf<'footer'>>(
  ({ className, ...props }, ref) => {
    return (
      <footer
        {...props}
        className={twMerge(
          'flex flex-col max-w-[1160px] mx-auto mt-6 pt-8 pb-16 space-y-4 bg-mono-20 dark:bg-mono-200',
          className
        )}
        ref={ref}
      >
        <div className="flex justify-between">
          <NavLink className="block" to={constants.logoConfig.path}>
            <Logo />
          </NavLink>

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
        <div className="flex items-center justify-end space-x-8">
          {constants.socialConfigs.map(({ Icon, name, ...linkProps }) => (
            <a
              key={name}
              {...linkProps}
              className="text-mono-100 hover:text-mono-200 dark:hover:text-mono-40"
            >
              <Icon size="lg" className="!fill-current" />
            </a>
          ))}
        </div>

        <div className="flex justify-between">
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
      </footer>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

const FooterNavItem: FC<{
  header: string;
  links: Array<Link | ExternalLink>;
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
