import { type FC } from 'react';
import { AccountStatsCardBodyProps } from '.';
import cx from 'classnames';

export const AccountStatsCardBody: FC<AccountStatsCardBodyProps> = ({
  children,
  className,
  statsItems = [],
  socialLinks = [],
  ...props
}) => {
  return (
    <div {...props} className="w-full space-y-5">
      <div className="grid grid-cols-2 grid-rows-2 min-h-[120px]">
        {Array.from({ length: 4 }).map((_, index) => {
          const item = statsItems[index];
          const isLeftColumn = index % 2 === 0;
          const isTopRow = index < 2;

          return item ? (
            <div
              key={index}
              className={cx('gap-0 border-border p-2', {
                'border-r': isLeftColumn,
                'border-b': isTopRow,
                'pl-5': !isLeftColumn,
              })}
            >
              <p className="text-muted-foreground text-xs">{item.title}</p>
              {item.children}
            </div>
          ) : (
            <div
              key={`placeholder-${index}`}
              className={cx('border-border p-2', {
                'border-r': isLeftColumn,
                'border-b': isTopRow,
                'pl-5': !isLeftColumn,
              })}
            />
          );
        })}
      </div>

      {socialLinks.length > 0 && (
        <div className="flex flex-wrap items-start justify-start gap-2">
          {socialLinks.map((link, index) => (
            <a
              key={`${link.name ?? 'social'}-${index}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-3 py-1 text-muted-foreground text-xs hover:text-foreground"
            >
              {link.name ?? 'Link'}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

AccountStatsCardBody.displayName = 'AccountStatsCardBody';
