'use client';

import { AccordionTrigger } from '@radix-ui/react-accordion';
import { ArrowRight, ChevronDown, Menu } from '@tangle-network/icons';
import { ThemeSwitcherButton } from '@tangle-network/ui-components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@tangle-network/ui-components/components/Accordion';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  DropdownMenuItem,
} from '@tangle-network/ui-components/components/Dropdown';
import {
  TANGLE_DAPP_URL,
  TANGLE_MKT_URL,
} from '@tangle-network/ui-components/constants';
import cx from 'classnames';
import type { ComponentProps } from 'react';
import { Link } from 'react-router';

type NavItem = ComponentProps<typeof Link> & {
  children: NonNullable<React.ReactNode>;
};

const isNavItem = (
  item: NavItem | { [label: string]: Array<NavItem> },
): item is NavItem => 'to' in item;

const navItems: Array<NavItem | { [label: string]: Array<NavItem> }> = [
  {
    children: 'ecosystem',
    to: new URL('/ecosystem', TANGLE_MKT_URL).toString(),
    target: '_blank',
  } satisfies NavItem,
  {
    children: 'operators',
    to: new URL('/operators', TANGLE_MKT_URL).toString(),
    target: '_blank',
  } satisfies NavItem,
] as const;

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex items-center gap-2">
        <li className="hidden sm:block">
          <Button
            href={TANGLE_DAPP_URL}
            target="blank"
            className="px-5 border lg:py-4"
          >
            Launch dApp
          </Button>
        </li>

        <li className="flex items-center justify-center lg:hidden">
          <MobileNav />
        </li>

        <ThemeSwitcherButton />
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

      <DropdownBody isPortal={false} className="mt-4" size="sm">
        {navItems.map((item, idx) => {
          if (isNavItem(item)) {
            return (
              <DropdownMenuItem
                key={idx}
                className={cx(
                  'px-2 py-4 rounded-none text-center font-bold border-b last:border-b-0 border-mono-0 dark:border-mono-160',
                  {
                    'hover:!bg-transparent': !isNavItem(item),
                  },
                )}
              >
                <Link {...item}>{item.children}</Link>
              </DropdownMenuItem>
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
                    'px-4 py-2 rounded-lg',
                  )}
                >
                  <span>{label}</span>

                  <ChevronDown
                    size="lg"
                    className="block duration-300 ease-in-out transform group-radix-state-open:rotate-180"
                  />
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-4 pl-4 pr-0 mt-4 space-y-4 border-b-2 border-mono-0 dark:border-mono-160">
                  {props.map((subItem, idx) => (
                    <DropdownMenuItem
                      className="px-4 py-2 rounded-lg"
                      rightIcon={
                        <ArrowRight className="!fill-current" size="lg" />
                      }
                      key={`${subItem.children.toString()}-${idx}`}
                    >
                      <Link {...subItem}>{subItem.children}</Link>
                    </DropdownMenuItem>
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
