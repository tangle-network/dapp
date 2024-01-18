'use client';

import { AccordionTrigger } from '@radix-ui/react-accordion';
import { ArrowRight, ChevronDown, Menu } from '@webb-tools/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@webb-tools/webb-ui-components/components/Accordion';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import {
  TANGLE_MKT_URL,
  TANGLE_STANDALONE_EXPLORER_URL,
  WEBB_BLOG_URL,
} from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import Link from 'next/link';
import type { ComponentProps } from 'react';

type NavItem = ComponentProps<typeof Link> & {
  children: NonNullable<React.ReactNode>;
};

const isNavItem = (
  item: NavItem | { [label: string]: Array<NavItem> }
): item is NavItem => 'href' in item;

const navItems: Array<NavItem | { [label: string]: Array<NavItem> }> = [
  {
    children: 'community',
    href: new URL('/community', TANGLE_MKT_URL).toString(),
    target: '_blank',
  } satisfies NavItem,
  {
    children: 'ecosystem',
    href: new URL('/ecosystem', TANGLE_MKT_URL).toString(),
    target: '_blank',
  } satisfies NavItem,
  {
    children: 'validators',
    href: new URL('/validators', TANGLE_MKT_URL).toString(),
    target: '_blank',
  } satisfies NavItem,
  {
    children: 'Webb Blog',
    href: WEBB_BLOG_URL,
    target: '_blank',
  } satisfies NavItem,
];

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex items-center space-x-2 lg:space-x-1.5">
        {navItems.map((item, idx) => {
          if (isNavItem(item)) {
            return (
              <li
                className="hidden lg:block px-6 py-2 rounded-[50px] hover:bg-[#f3f5fb]"
                key={idx}
              >
                <Link {...item}>
                  <Typography
                    className="capitalize"
                    variant="body1"
                    component="span"
                  >
                    {item.children}
                  </Typography>
                </Link>
              </li>
            );
          }

          const label = Object.keys(item)[0];
          const props = Object.values(item)[0];

          return (
            <li className="hidden lg:block" key={idx}>
              <Dropdown>
                <DropdownBasicButton className="flex items-center space-x-2 group">
                  <Typography className="capitalize" variant="body1">
                    {label}
                  </Typography>

                  <ChevronDown className="mx-2 transition-transform duration-300 ease-in-out group-radix-state-open:-rotate-180" />
                </DropdownBasicButton>

                <DropdownBody
                  isPortal={false}
                  className="p-4 mt-4 space-y-4 w-[374px]"
                  size="sm"
                  align="start"
                >
                  {props.map((subItem, idx) => (
                    <Link
                      key={`${subItem.children.toString()}-${idx}`}
                      {...subItem}
                    >
                      <MenuItem
                        className="px-4 py-2 rounded-lg hover:text-blue-70"
                        icon={
                          <ArrowRight className="!fill-current" size="lg" />
                        }
                      >
                        {subItem.children}
                      </MenuItem>
                    </Link>
                  ))}
                </DropdownBody>
              </Dropdown>
            </li>
          );
        })}

        <li>
          <Button
            href={TANGLE_STANDALONE_EXPLORER_URL}
            target="blank"
            className="px-5 lg:py-4 border"
          >
            Explore Testnet
          </Button>
        </li>

        <li className="flex items-center justify-center lg:hidden">
          <MobileNav />
        </li>
      </ul>
    </nav>
  );
};

const MobileNav = () => {
  return (
    <Dropdown>
      <DropdownBasicButton className="flex items-center justify-center group">
        <Menu className="block" size="lg" />
      </DropdownBasicButton>

      <DropdownBody
        isPortal={false}
        className="mt-4 pt-4 w-screen border-0 rounded-none"
        size="sm"
        align="start"
      >
        {navItems.map((item, idx) => {
          if (isNavItem(item)) {
            return (
              <Link key={idx} {...item}>
                <MenuItem
                  className={cx(
                    'px-2 py-4 rounded-none text-center text-mono-200 font-bold border-y border-mono-40',
                    {
                      'hover:!bg-transparent': !isNavItem(item),
                    }
                  )}
                >
                  {item.children}
                </MenuItem>
              </Link>
            );
          }

          const label = Object.keys(item)[0];
          const props = Object.values(item)[0];

          return (
            <Accordion key={idx} type={'single'} collapsible>
              <AccordionItem className="p-0" value={label}>
                <AccordionTrigger
                  className={cx(
                    'flex items-center justify-between w-full capitalize',
                    'group hover:bg-blue-0 dark:hover:bg-blue-120',
                    'px-4 py-2 rounded-lg'
                  )}
                >
                  <span>{label}</span>

                  <ChevronDown
                    size="lg"
                    className="block duration-300 ease-in-out transform group-radix-state-open:rotate-180"
                  />
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-4 pl-4 pr-0 mt-4 space-y-4 border-b-2 border-mono-200">
                  {props.map((subItem, idx) => (
                    <Link key={idx} {...subItem}>
                      <MenuItem
                        className="px-4 py-2 rounded-lg hover:text-blue-70"
                        icon={
                          <ArrowRight className="!fill-current" size="lg" />
                        }
                        key={`${subItem.children.toString()}-${idx}`}
                      >
                        {subItem.children}
                      </MenuItem>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </DropdownBody>
    </Dropdown>
  );
};
