import { Typography } from '../../typography';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../Button';
import { WebsiteCommunityProps } from './types';

/**
 * The `WebsiteCommunity` component
 * Sets up styles, and spacing vertically between `block` components
 * @example
 * ```jsx
 * <WebsiteCommunity
 *  links={[
 *    {
        name: 'Github',
        Icon: GithubFill,
        href: 'https://github.com/webb-tools',
        description: 'Explore the source code and get involved',
      },
      {
        name: 'Documentation',
        Icon: DocumentationIcon,
        href: 'https://docs.webb.tools/docs',
        description: 'Learn how it works under the hood',
      },
      {
        name: 'Telegram',
        Icon: TelegramFill,
        href: 'https://t.me/webbprotocol',
        description: 'Have question, join us on Telegram',
      },
 *  ]}
 * />
 * ```
 * @param links - array of links of type `LinksType`
 * @param cardContainerClassName - className for the container of the cards
 * @param cardClassName - className for the card
 */
export const WebsiteCommunity = ({
  links,
  cardContainerClassName,
  cardClassName,
}: WebsiteCommunityProps) => {
  const cardContainerClsx = useMemo(
    () =>
      twMerge(
        'mt-[24px] grid gap-4 justify-center md:grid-cols-2 px-4',
        cardContainerClassName
      ),
    [cardContainerClassName]
  );

  const cardClsx = useMemo(
    () =>
      twMerge(
        'flex flex-col p-4 min-w-[358px] bg-mono-0 rounded-lg space-y-2 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]',
        cardClassName
      ),
    [cardClassName]
  );

  return (
    <div className={cardContainerClsx}>
      {links.map(({ Icon, name, href, description }) => (
        <div className={cardClsx} key={href}>
          <span className="flex items-center space-x-2.5">
            <Icon className="w-8 h-8 !fill-current" />
            <Typography variant="h5" className="text-mono-200" fw="bold">
              {name}
            </Typography>
          </span>

          <Typography variant="body1" className="text-mono-140">
            {description}
          </Typography>

          <Button variant="link" href={href} target="_blank">
            {name}
          </Button>
        </div>
      ))}
    </div>
  );
};
