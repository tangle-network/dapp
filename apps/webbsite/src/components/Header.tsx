import { ChevronDown } from '@webb-tools/icons';
import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { Logo } from '@webb-tools/webb-ui-components/components/Logo/Logo';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Link from 'next/link';

import { BRIDGE_URL } from '../constants';

interface NavItem {
  /**
   * The label of the link
   */
  label: string;

  /**
   * The url of the link
   */
  url: string;

  /**
   * If true, the link will use the Next.js link component
   */
  isInternal?: boolean;
}

const isNavItem = (item: any): item is NavItem => {
  return 'label' in item && 'url' in item;
};

const navItems: Array<NavItem | { [label: string]: Array<NavItem> }> = [
  { protocols: [] },
  { label: 'research', url: '#', isInternal: true },
  { label: 'community', url: '#' },
  { label: 'developer', url: '#' },
];

const Header = () => {
  return (
    <header className="fixed z-50 w-full bg-mono-0">
      <div className="max-w-[1200px] mx-auto p-4 flex items-center justify-between">
        <Logo />

        <nav>
          <ul className="flex items-center space-x-6">
            {navItems.map((item, idx) => (
              <li key={idx}>
                {isNavItem(item) ? (
                  item.isInternal ? (
                    <Link href={item.url}>
                      <Typography
                        className="capitalize"
                        variant="body1"
                        fw="bold"
                        component="span"
                      >
                        {item.label}
                      </Typography>
                    </Link>
                  ) : (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <Typography
                        className="capitalize"
                        variant="body1"
                        fw="bold"
                      >
                        {item.label}
                      </Typography>
                    </a>
                  )
                ) : (
                  <Dropdown>
                    <DropdownBasicButton className="flex items-center space-x-2 group">
                      <Typography
                        className="capitalize"
                        variant="body1"
                        fw="bold"
                      >
                        {Object.keys(item)[0]}
                      </Typography>

                      <ChevronDown className="mx-2 transition-transform duration-300 ease-in-out group-radix-state-open:-rotate-180" />
                    </DropdownBasicButton>

                    <DropdownBody size="sm">
                      {Object.values(item)[0].map((subItem, idx) => (
                        <MenuItem key={idx}>
                          {subItem.isInternal ? (
                            <Link className="!text-inherit" href={subItem.url}>
                              {subItem.label}
                            </Link>
                          ) : (
                            <a
                              href={subItem.url}
                              target="_blank"
                              rel="noreferrer"
                              className="!text-inherit"
                            >
                              {subItem.label}
                            </a>
                          )}
                        </MenuItem>
                      ))}
                    </DropdownBody>
                  </Dropdown>
                )}
              </li>
            ))}
            <li>
              <Button href={BRIDGE_URL} target="_blank" rel="noreferrer">
                Bridge
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
