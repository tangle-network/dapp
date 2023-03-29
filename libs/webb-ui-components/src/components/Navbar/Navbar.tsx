import { AccordionTrigger } from '@radix-ui/react-accordion';
import {
  ArrowRight,
  ChevronDown,
  CloseCircleLineIcon,
  Menu,
} from '@webb-tools/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC, forwardRef, useMemo } from 'react';
import { InternalOrExternalLink } from './InternalOrExternalLink';
import { MobileNavProps, NavbarProps, NavItemType } from './types';

const isNavItem = (item: any): item is NavItemType => {
  return 'label' in item && 'url' in item;
};

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ navItems: navItemsProp, buttonProps, ...props }, ref) => {
    const navItems = useMemo(() => navItemsProp ?? [], [navItemsProp]);

    return (
      <nav {...props} ref={ref}>
        <ul className="flex items-center gap-x-6">
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
                    <Typography
                      className="capitalize"
                      variant="body1"
                      fw="bold"
                    >
                      {Object.keys(item)[0]}
                    </Typography>

                    <ChevronDown className="mx-2 transition-transform duration-300 ease-in-out group-radix-state-open:-rotate-180" />
                  </DropdownBasicButton>

                  <DropdownBody
                    isPorttal={false}
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

          {buttonProps &&
            buttonProps.length > 0 &&
            buttonProps.map((buttonProp, key) => (
              <li key={key}>
                <Button {...buttonProp} />
              </li>
            ))}

          <li className="flex items-center justify-center md:hidden">
            <MobileNav navItems={navItems} />
          </li>
        </ul>
      </nav>
    );
  }
);

const MobileNav: FC<MobileNavProps> = ({ navItems: navItemsProp }) => {
  const navItems = navItemsProp ?? [];

  return (
    <Dropdown>
      <DropdownBasicButton className="flex items-center justify-center group">
        <Menu className="block group-radix-state-open:hidden" size="lg" />

        <CloseCircleLineIcon
          className="hidden group-radix-state-open:block"
          size="lg"
        />
      </DropdownBasicButton>

      <DropdownBody
        isPorttal={false}
        className="mt-4 p-4 space-y-4 w-screen sm:w-[374px]"
        size="sm"
        align="start"
      >
        {navItems.map((item, idx) =>
          isNavItem(item) ? (
            <InternalOrExternalLink key={idx} {...item}>
              <MenuItem
                className={cx('px-4 py-2 rounded-lg', {
                  'hover:!bg-transparent': !isNavItem(item),
                })}
                icon={
                  isNavItem(item) ? (
                    <ArrowRight className="!fill-current" size="lg" />
                  ) : undefined
                }
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
