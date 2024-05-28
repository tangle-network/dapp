'use client';

import Link from 'next/link';
import {
  forwardRef,
  useState,
  type ComponentProps,
  type ElementRef,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';
import { InternalOrExternalLink } from '../Navbar/InternalOrExternalLink';
import { TangleLogo } from '../TangleLogo';
import { WebsiteNewsletterForm } from '../WebsiteNewsLetterForm';

import type { WebbFooterProps } from './types';
import { getNavLinks, getSocials } from './utils';

export const WebsiteFooter = forwardRef<
  ElementRef<'footer'>,
  ComponentProps<'footer'> & WebbFooterProps
>(({ websiteType = 'webb', hideNewsletter, className, ...props }, ref) => {
  // State for subscription success
  const [success, setSuccess] = useState(false);

  return (
    <footer
      {...props}
      className={twMerge('pb-4 space-y-6 dark bg-mono-200', className)}
      ref={ref}
    >
      {/** Newsletter */}
      {!hideNewsletter && (
        <div className="px-4 py-16 space-y-12 md:pt-24 bg-mono-180 md:pb-9">
          {/** Title and subtitle */}
          <div className="md:pb-9 max-w-[900px] mx-auto space-y-6">
            <Typography
              variant="mkt-h3"
              className="text-[34px] leading-[46px] dark:text-mono-0 font-black"
            >
              Scaling Privacy for <br />
              Everyone, Everything, Everywhere.
            </Typography>

            {!success && (
              <div className="space-y-6">
                <Typography
                  variant="mkt-subheading"
                  className="text-lg font-black leading-6 dark:text-mono-80"
                >
                  Follow for Updates
                </Typography>

                <WebsiteNewsletterForm onSuccess={() => setSuccess(true)} />

                <Typography
                  variant="mkt-body2"
                  className="font-medium dark:text-mono-100"
                >
                  By signing up you agree to{' '}
                  <InternalOrExternalLink
                    url="/terms-and-conditions"
                    isInternal={false}
                    className="inline-block dark:text-mono-0 hover:underline"
                  >
                    terms & conditions
                  </InternalOrExternalLink>
                </Typography>
              </div>
            )}

            {success && (
              <div className="space-y-6">
                <Typography variant="mkt-h3">
                  {"Now you're in the loop"}
                </Typography>

                <Typography variant="mkt-caption">
                  Thanks for signing up! Keep an eye on your inbox for updates
                  from the Webb community.
                </Typography>
              </div>
            )}
          </div>
        </div>
      )}

      {/** Navigation Links */}
      <div className="w-full max-w-[900px] flex flex-col gap-9 px-4 py-12 mx-auto">
        {/** Logo and links */}
        <div className="flex flex-col items-center space-y-4 md:items-start md:space-y-0 md:space-x-8 md:flex-row md:justify-between">
          <Link href="/">{<TangleLogo />}</Link>
          {getNavLinks(websiteType).map(({ group, links }) => (
            <div className="hidden md:flex md:flex-col flex-[1]" key={group}>
              <Typography
                variant="mkt-body2"
                className="!text-lg mb-4 font-black"
              >
                {group}
              </Typography>
              <div className="flex flex-col gap-2">
                {links.map(({ label, ...restProps }) => (
                  <Typography
                    variant="mkt-body2"
                    className="font-medium hover:underline"
                    key={label}
                  >
                    <InternalOrExternalLink {...restProps}>
                      {label}
                    </InternalOrExternalLink>
                  </Typography>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/** Socials */}
        <div className="flex items-center justify-center space-x-4 md:justify-end">
          {getSocials(websiteType).map(({ Icon, name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="dark:text-mono-0 dark:hover:text-mono-100"
            >
              <Icon className="w-8 h-8 !fill-mono-60" />
            </a>
          ))}
        </div>

        <Typography variant="mkt-body1" className="text-center md:text-right">
          © {new Date().getFullYear()} Webb Technologies, Inc. All rights
          reserved.
        </Typography>
      </div>
    </footer>
  );
});
