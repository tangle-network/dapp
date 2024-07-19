import {
  BookOpenLineIcon,
  FaucetIcon,
  FlaskLineIcon,
  HelpLineIcon,
  InformationLine,
  TangleIcon,
} from '@webb-tools/icons';
import { Fragment, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { DropdownBody, DropdownMenuItem } from '../Dropdown';
import { NavigationMenuContentProps } from './types';

/**
 * The navigation menu content, must use inside the `NavigationMenu` component
 */
export const NavigationMenuContent = forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(
  (
    {
      className,
      onDocsClick,
      onAboutClick,
      onDevelopmentClick,
      onFaucetClick,
      onHelpCenterClick,
      onRequestFeaturesClick,
      onTestnetClick,
      extraMenuItems,
      version,
      ...props
    },
    ref,
  ) => {
    return (
      <DropdownBody
        {...props}
        className={twMerge(
          'pt-2 mt-6 w-full min-w-[200px]',
          !version ? 'pb-2' : '',
          className,
        )}
        ref={ref}
      >
        {onDocsClick && (
          <DropdownMenuItem
            rightIcon={<BookOpenLineIcon size="lg" />}
            onClick={onDocsClick}
          >
            Docs
          </DropdownMenuItem>
        )}

        {onFaucetClick && (
          <DropdownMenuItem
            rightIcon={<FaucetIcon size="lg" />}
            onClick={onFaucetClick}
          >
            Faucet
          </DropdownMenuItem>
        )}

        {(onHelpCenterClick || onRequestFeaturesClick) && (
          <NavigationMenuDivider />
        )}

        {onHelpCenterClick && (
          <DropdownMenuItem
            rightIcon={<HelpLineIcon size="lg" />}
            onClick={onHelpCenterClick}
          >
            Help Center
          </DropdownMenuItem>
        )}

        {onRequestFeaturesClick && (
          <DropdownMenuItem
            rightIcon={<FlaskLineIcon size="lg" />}
            onClick={onRequestFeaturesClick}
          >
            Request Features
          </DropdownMenuItem>
        )}

        {(onTestnetClick || onAboutClick) && <NavigationMenuDivider />}

        {onTestnetClick && (
          <DropdownMenuItem
            rightIcon={<TangleIcon size="lg" />}
            onClick={onTestnetClick}
          >
            Substrate Portal
          </DropdownMenuItem>
        )}

        {onAboutClick && (
          <DropdownMenuItem
            rightIcon={<InformationLine size="lg" />}
            onClick={onAboutClick}
          >
            About
          </DropdownMenuItem>
        )}

        {(extraMenuItems || version) && <NavigationMenuDivider />}

        {extraMenuItems && (
          <>
            {extraMenuItems.map((item, idx) => (
              <Fragment key={idx}>{item}</Fragment>
            ))}
          </>
        )}

        {/** Bottom version */}
        {version && (
          <div className="px-4 pt-1.5 pb-2">
            <Typography
              variant="body4"
              ta="right"
              className="text-mono-100 dark:text-mono-40"
            >
              {version.toLowerCase().startsWith('v') ? version : `v${version}`}
            </Typography>
          </div>
        )}
      </DropdownBody>
    );
  },
);

const NavigationMenuDivider = () => {
  return <div className="my-1 border-b border-mono-80 dark:border-mono-120" />;
};
