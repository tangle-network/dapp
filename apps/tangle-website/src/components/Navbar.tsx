import { AccordionTrigger } from '@radix-ui/react-accordion';
import { ArrowRight, ChevronDown, Menu } from '@webb-tools/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import {
  DKG_STATS_URL,
  WEBB_DOC_ROUTES_RECORD,
} from '@webb-tools/webb-ui-components/constants';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';
import cx from 'classnames';

import { IInternalOrExternalLink, InternalOrExternalLink, LinkButton } from '.';

type NavItem = IInternalOrExternalLink;

const isNavItem = (item: any): item is NavItem => {
  return 'label' in item && 'url' in item;
};

const navItems: Array<NavItem | { [label: string]: Array<NavItem> }> = [
  {
    label: 'community',
    url: '#community',
    isInternal: true,
  },
  {
    label: 'docs',
    url: populateDocsUrl(WEBB_DOC_ROUTES_RECORD['tangle-network'].overview),
  },
  {
    label: 'ecosystem',
    url: '#',
    onClick: (e) => {
      e.preventDefault();
    },
    isInternal: true,
  }, // TODO: Add ecosystem page
];

export const Navbar = () => {
  return (
    <nav>
      <ul className="flex items-center space-x-2 md:space-x-6">
        {navItems.map((item, idx) => (
          <li className="hidden md:block" key={idx}>
            {isNavItem(item) ? (
              <InternalOrExternalLink
                url={item.url}
                isInternal={item.isInternal}
              >
                <Typography
                  className="capitalize"
                  variant="body1"
                  fw="bold"
                  component="span"
                >
                  {item.label}
                </Typography>
              </InternalOrExternalLink>
            ) : (
              <Dropdown>
                <DropdownBasicButton className="flex items-center space-x-2 group">
                  <Typography className="capitalize" variant="body1" fw="bold">
                    {Object.keys(item)[0]}
                  </Typography>

                  <ChevronDown className="mx-2 transition-transform duration-300 ease-in-out group-radix-state-open:-rotate-180" />
                </DropdownBasicButton>

                <DropdownBody
                  isPortal={false}
                  className="p-4 mt-4 space-y-4 w-[374px]"
                  size="sm"
                  align="start"
                >
                  {Object.values(item)[0].map((subItem, idx) => (
                    <InternalOrExternalLink
                      key={idx}
                      url={subItem.url}
                      isInternal={subItem.isInternal}
                    >
                      <MenuItem
                        className="px-4 py-2 rounded-lg hover:text-blue-70"
                        icon={
                          <ArrowRight className="!fill-current" size="lg" />
                        }
                      >
                        {subItem.label}
                      </MenuItem>
                    </InternalOrExternalLink>
                  ))}
                </DropdownBody>
              </Dropdown>
            )}
          </li>
        ))}

        <li>
          <LinkButton href={DKG_STATS_URL} className="px-5 md:px-9">
            View Network
          </LinkButton>
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
        {navItems.map((item, idx) =>
          isNavItem(item) ? (
            <InternalOrExternalLink key={idx} {...item}>
              <MenuItem
                className={cx(
                  'px-2 py-4 rounded-none text-center text-mono-200 font-bold border-y border-mono-40',
                  {
                    'hover:!bg-transparent': !isNavItem(item),
                  }
                )}
              >
                {item.label}
              </MenuItem>
            </InternalOrExternalLink>
          ) : (
            <Accordion key={idx} type={'single'} collapsible>
              <AccordionItem className="p-0" value={Object.keys(item)[0]}>
                <AccordionTrigger
                  className={cx(
                    'flex items-center justify-between w-full capitalize',
                    'group hover:bg-blue-0 dark:hover:bg-blue-120',
                    'px-4 py-2 rounded-lg'
                  )}
                >
                  <span>{Object.keys(item)[0]}</span>

                  <ChevronDown
                    size="lg"
                    className="block duration-300 ease-in-out transform group-radix-state-open:rotate-180"
                  />
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-4 pl-4 pr-0 mt-4 space-y-4 border-b-2 border-mono-200">
                  {Object.values(item)[0].map((subItem, idx) => (
                    <InternalOrExternalLink key={idx} {...subItem}>
                      <MenuItem
                        className="px-4 py-2 rounded-lg hover:text-blue-70"
                        icon={
                          <ArrowRight className="!fill-current" size="lg" />
                        }
                        key={`${subItem.label}-${idx}`}
                      >
                        {subItem.label}
                      </MenuItem>
                    </InternalOrExternalLink>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        )}
      </DropdownBody>
    </Dropdown>
  );
};
