import capitalize from 'lodash/capitalize';
import {
  SOCIAL_ICONS_RECORD,
  SOCIAL_URLS_RECORD,
  TANGLE_DOCS_URL,
  TANGLE_MKT_URL,
  TANGLE_TWITTER_URL,
  TANGLE_GITHUB_URL,
  TANGLE_PRESS_KIT_URL,
  TANGLE_PRIVACY_POLICY_URL,
  TANGLE_TERMS_OF_SERVICE_URL,
  TANGLE_WHITEPAPER_URL,
  WEBB_AVAILABLE_SOCIALS,
  WEBB_DOCS_URL,
  WEBB_CAREERS_URL,
  WEBB_MKT_URL,
} from '../../constants';
import type { WebsiteType, SocialType, NavLinkType } from './types';

export function getNavLinks(websiteType: WebsiteType) {
  const isTangleSite = websiteType === 'tangle';
  return [
    {
      group: 'Community',
      links: [
        {
          label: 'GitHub',
          url: SOCIAL_URLS_RECORD.github,
          isInternal: false,
        },
        {
          label: 'Telegram',
          url: SOCIAL_URLS_RECORD.telegram,
          isInternal: false,
        },
        {
          label: 'Discord',
          url: SOCIAL_URLS_RECORD.discord,
          isInternal: false,
        },
        {
          label: 'Twitter',
          url: isTangleSite ? TANGLE_TWITTER_URL : SOCIAL_URLS_RECORD.twitter,
          isInternal: false,
        },
        {
          label: 'Commonwealth',
          url: SOCIAL_URLS_RECORD.commonwealth,
          isInternal: false,
        },
      ],
    },
    {
      group: 'Ecosystem',
      links: [
        {
          label: 'Tangle',
          url: TANGLE_MKT_URL,
          isInternal: false,
        },
      ],
    },
    {
      group: 'Developer',
      links: [
        {
          label: 'Documentation',
          url: isTangleSite ? TANGLE_DOCS_URL : WEBB_DOCS_URL,
          isInternal: false,
        },
        {
          label: 'Source Code',
          url: isTangleSite ? TANGLE_GITHUB_URL : SOCIAL_URLS_RECORD.github,
          isInternal: false,
        },
        {
          label: 'Whitepaper',
          url: TANGLE_WHITEPAPER_URL,
          isInternal: false,
        },
      ],
    },
    {
      group: 'Company',
      links: [
        {
          label: 'About Us',
          url: WEBB_MKT_URL,
          isInternal: false,
        },
        {
          label: 'Careers',
          url: WEBB_CAREERS_URL,
          isInternal: false,
        },
        ...(isTangleSite
          ? [
              {
                label: 'Brand Kit',
                url: TANGLE_PRESS_KIT_URL,
                isInternal: false,
              },
            ]
          : []),
      ],
    },
    {
      group: 'Legal',
      links: [
        {
          label: 'Privacy Policy',
          url: TANGLE_PRIVACY_POLICY_URL,
        },
        {
          label: 'Terms of Service',
          url: TANGLE_TERMS_OF_SERVICE_URL,
        },
      ],
    },
  ] as const satisfies Array<NavLinkType>;
}

export function getSocials(websiteType: WebsiteType) {
  const urlRecord =
    websiteType === 'webb'
      ? SOCIAL_URLS_RECORD
      : ({
          ...SOCIAL_URLS_RECORD,
          twitter: TANGLE_TWITTER_URL,
          github: TANGLE_GITHUB_URL,
        } as const satisfies {
          [key in (typeof WEBB_AVAILABLE_SOCIALS)[number]]: string;
        });

  return WEBB_AVAILABLE_SOCIALS.map(
    (name) =>
      ({
        name: capitalize(name),
        Icon: SOCIAL_ICONS_RECORD[name],
        href: urlRecord[name],
      }) as const satisfies SocialType,
  );
}
