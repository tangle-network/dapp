import { DocumentationIcon } from '@tangle-network/icons/DocumentationIcon';
import GlobalLine from '@tangle-network/icons/GlobalLine';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import {
  CoinsLineIcon,
  GiftLineIcon,
  HomeFillIcon,
  ShieldKeyholeLineIcon,
} from '@tangle-network/icons';
import { TangleKnot } from '@tangle-network/sandbox-ui/primitives';
import { type ComponentType, type FC, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../types';

const TANGLE_DOCS_URL = 'https://docs.tangle.tools';

type IconComponent = ComponentType<{ className?: string }>;

type SidebarItem = {
  name: string;
  href: string;
  isInternal: boolean;
  Icon: IconComponent;
  subItems?: Array<{
    name: string;
    href: string;
    isInternal: boolean;
  }>;
};

type Props = {
  isExpandedByDefault?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    name: 'Home',
    href: PagePath.INSTANCES,
    isInternal: true,
    Icon: HomeFillIcon,
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    Icon: GridFillIcon,
  },
  {
    name: 'Operators',
    href: PagePath.OPERATORS,
    isInternal: true,
    Icon: GlobalLine,
  },
  {
    name: 'Rewards',
    href: PagePath.REWARDS,
    isInternal: true,
    Icon: GiftLineIcon,
  },
  {
    name: 'Earnings',
    href: PagePath.EARNINGS,
    isInternal: true,
    Icon: CoinsLineIcon,
  },
  {
    name: 'Payments',
    href: PagePath.PAYMENTS_POOL,
    isInternal: true,
    Icon: ShieldKeyholeLineIcon,
    subItems: [
      {
        name: 'Shielded Pool',
        href: PagePath.PAYMENTS_POOL,
        isInternal: true,
      },
      {
        name: 'Credits',
        href: PagePath.PAYMENTS_CREDITS,
        isInternal: true,
      },
    ],
  },
];

const DOCS_ITEM: SidebarItem = {
  name: 'Docs',
  href: TANGLE_DOCS_URL,
  isInternal: false,
  Icon: DocumentationIcon,
};

const Sidebar: FC<Props> = ({ isExpandedByDefault, onExpandedChange }) => {
  const pathname = useLocation().pathname;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(
    isExpandedByDefault ?? true,
  );

  const toggleDesktopExpanded = () => {
    setIsDesktopExpanded((current) => {
      const next = !current;
      window.localStorage.setItem(
        'tangle-cloud-sidebar-expanded',
        String(next),
      );
      onExpandedChange?.(next);
      return next;
    });
  };

  return (
    <>
      <aside
        className={twMerge(
          'fixed bottom-0 left-0 top-0 z-50 hidden shrink-0 border-border border-r bg-background transition-[width] duration-200 lg:flex lg:flex-col',
          isDesktopExpanded ? 'w-64' : 'w-16',
        )}
      >
        <SidebarBrand isExpanded={isDesktopExpanded} />
        <div className="px-2 pb-3">
          <SidebarCollapseButton
            isExpanded={isDesktopExpanded}
            onClick={toggleDesktopExpanded}
          />
        </div>
        <SidebarNav
          items={SIDEBAR_ITEMS}
          pathname={pathname}
          isExpanded={isDesktopExpanded}
        />
        <div className="mt-auto px-2 pb-3">
          <SidebarLink
            item={DOCS_ITEM}
            pathname={pathname}
            isExpanded={isDesktopExpanded}
          />
        </div>
      </aside>

      <div className="fixed left-4 top-2 z-[45] lg:hidden">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Toggle navigation"
          onClick={() => setIsMobileOpen((value) => !value)}
        >
          <TangleKnot size={22} className="text-primary" />
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 lg:hidden">
          <aside className="fixed bottom-0 left-0 top-0 w-64 border-r border-border bg-background shadow-[var(--shadow-card)]">
            <SidebarBrand isExpanded />
            <SidebarNav
              items={SIDEBAR_ITEMS}
              pathname={pathname}
              isExpanded
              onNavigate={() => setIsMobileOpen(false)}
            />
            <div className="mt-8">
              <SidebarLink
                item={DOCS_ITEM}
                pathname={pathname}
                isExpanded
                onNavigate={() => setIsMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

const SidebarBrand = ({ isExpanded }: { isExpanded: boolean }) => (
  <Link
    to={PagePath.INSTANCES}
    className={
      isExpanded
        ? 'mb-4 flex h-14 items-center gap-3 px-4 text-foreground'
        : 'flex h-14 items-center justify-center text-foreground'
    }
  >
    <span className="grid h-9 w-9 place-items-center rounded-md transition-colors hover:bg-muted/50">
      <TangleKnot size={22} className="text-primary" />
    </span>
    {isExpanded && (
      <span className="font-display text-base font-extrabold tracking-tight">
        Tangle Cloud
      </span>
    )}
  </Link>
);

const SidebarNav = ({
  items,
  pathname,
  isExpanded,
  onNavigate,
}: {
  items: SidebarItem[];
  pathname: string;
  isExpanded: boolean;
  onNavigate?: () => void;
}) => (
  <nav className={isExpanded ? 'space-y-1 px-2' : 'space-y-1 px-2'}>
    {items.map((item) => (
      <SidebarLink
        key={item.name}
        item={item}
        pathname={pathname}
        isExpanded={isExpanded}
        onNavigate={onNavigate}
      />
    ))}
  </nav>
);

const SidebarCollapseButton = ({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={twMerge(
      'group flex h-10 items-center rounded-md border border-border bg-muted/20 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
      isExpanded ? 'w-full justify-between px-3' : 'w-12 justify-center',
    )}
    aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation labels'}
    onClick={onClick}
  >
    {isExpanded && <span>Collapse</span>}
    <span aria-hidden>{isExpanded ? '‹' : '›'}</span>
  </button>
);

const SidebarLink = ({
  item,
  pathname,
  isExpanded,
  onNavigate,
}: {
  item: SidebarItem;
  pathname: string;
  isExpanded: boolean;
  onNavigate?: () => void;
}) => {
  const isSubItemActive =
    item.subItems?.some(
      (subItem) =>
        pathname === subItem.href || pathname.startsWith(`${subItem.href}/`),
    ) ?? false;
  const isActive =
    item.isInternal &&
    (pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      isSubItemActive);
  const Icon = item.Icon;
  const className = [
    'group flex items-center gap-3 rounded-md text-sm font-semibold transition-colors',
    isExpanded ? 'min-h-11 justify-start px-3' : 'h-11 w-12 justify-center',
    isActive
      ? 'bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
  ].join(' ');
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      {isExpanded && <span>{item.name}</span>}
    </>
  );

  return (
    <div>
      {item.isInternal ? (
        <Link to={item.href} className={className} onClick={onNavigate}>
          {content}
        </Link>
      ) : (
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className={className}
          onClick={onNavigate}
        >
          {content}
        </a>
      )}

      {isExpanded && item.subItems && isActive && (
        <div className="ml-8 mt-1 space-y-1 border-border border-l pl-3">
          {item.subItems.map((subItem) => {
            const isSubActive = pathname === subItem.href;
            return (
              <Link
                key={subItem.name}
                to={subItem.href}
                className={
                  isSubActive
                    ? 'block rounded-md px-3 py-2 text-xs font-semibold text-foreground'
                    : 'block rounded-md px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }
                onClick={onNavigate}
              >
                {subItem.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
