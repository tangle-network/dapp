import {
  Collapsible,
  CollapsibleButton,
  MenuItem,
  Popover,
  PopoverBody,
  PopoverButton,
  ThemeSwitcherItem,
} from '@webb-dapp/webb-ui-components/components';
import { OpenBook } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React from 'react';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import MenuIcon from './MenuIcon';

type SettingsPopoverProps = {
  buttonIcon: React.ReactElement;
  connectedEndpoint: string;
  setConnectedEndpoint: (endpoint: string) => void;
};

// React.forwardRef<HTMLDivElement, SettingsPopoverProps>((props, ref)

export const SettingsPopover = React.forwardRef<HTMLDivElement, SettingsPopoverProps>((props, ref) => {
  const { buttonIcon, connectedEndpoint, setConnectedEndpoint } = props;

  // This state variable tracks the user input of the 'Custom Data Source'
  const [endpointUserInput, setEndpointUserInput] = useState(connectedEndpoint);

  // A function to verify the user input before setting the connection.
  const verifyEndpoint = async (maybeEndpoint: string) => {
    // verify graphql service at endpoint:
    const req = await fetch(`${maybeEndpoint}?query=%7B__typename%7D`);

    if (req.ok) {
      return true;
    } else {
      throw new Error('Endpoint is not responding');
    }
  };

  // function to run after a user has finshed inputting a potential endpoint.
  const setEndpoint = async (endpoint: string) => {
    verifyEndpoint(endpoint).then((verified) => {
      if (verified) {
        localStorage.setItem('stats-endpoint', endpoint);
        setConnectedEndpoint(endpoint);
      }
    });
  };

  const icon = useMemo(() => {
    if (!buttonIcon) {
      return;
    }

    return React.cloneElement(buttonIcon, {
      ...buttonIcon.props,
      size: 'sm',
      className: twMerge('fill-current dark:fill-current', buttonIcon.props['className']),
    });
  }, [buttonIcon]);

  return (
    <Popover ref={ref}>
      <PopoverButton icon={icon} size='sm' />
      <PopoverBody className='mt-5 p-2' size='sm'>
        <div>
          <Typography variant={'h4'}>Settings</Typography>
          <ThemeSwitcherItem />
          <MenuItem icon={<OpenBook size='lg' />}>Docs</MenuItem>
          <Collapsible>
            <CollapsibleButton>Keygen Threshold</CollapsibleButton>
          </Collapsible>
        </div>
      </PopoverBody>
    </Popover>
  );
});
