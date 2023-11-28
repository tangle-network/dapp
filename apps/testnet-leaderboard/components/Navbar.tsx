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
  DKG_STATS_URL,
  WEBB_DOC_ROUTES_RECORD,
} from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';
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
    href: populateDocsUrl(WEBB_DOC_ROUTES_RECORD['tangle-network'].community),
    target: '_blank',
  } satisfies NavItem,
  {
    children: 'docs',
    href: populateDocsUrl(WEBB_DOC_ROUTES_RECORD['tangle-network'].overview),
    target: '_blank',
  } satisfies NavItem,
  // TODO: Add ecosystem link
  /* {
    children: 'ecosystem',
    href: '#',
  } satisfies NavItem, */
];

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex items-center space-x-2 md:space-x-6">
        {navItems.map((item, idx) => {
          if (isNavItem(item)) {
            return (
              <li className="hidden md:block" key={idx}>
                <Link {...item}>
                  <Typography
                    className="capitalize"
                    variant="body1"
                    fw="bold"
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
            <li className="hidden md:block" key={idx}>
              <Dropdown>
                <DropdownBasicButton className="flex items-center space-x-2 group">
                  <Typography className="capitalize" variant="body1" fw="bold">
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
          <Button href={DKG_STATS_URL} target="blank" className="px-5 md:px-9">
            View Network
          </Button>
        </li>

        <li className="flex items-center justify-center md:hidden">
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
        className="mt-4 pt-4 w-screen sm:w-[374px] border-0 rounded-none"
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
