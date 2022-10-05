import { defaultEndpoint } from '@webb-dapp/page-statistics/constants';
import {
  Button,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  DropdownButton,
  Input,
  Label,
  MenuItem,
  ThemeSwitcherItem,
} from '@webb-dapp/webb-ui-components/components';
import { OpenBook } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { useCallback } from 'react';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import MenuIcon from './MenuIcon';

type SettingsDropdownProps = {
  buttonIcon: React.ReactElement;
  connectedEndpoint: string;
  setConnectedEndpoint: (endpoint: string) => void;
};

export const SettingsDropdown = React.forwardRef<HTMLDivElement, SettingsDropdownProps>((props, ref) => {
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
  const setEndpoint = useCallback(
    async (endpoint: string) => {
      console.log('setEndpoint called');

      verifyEndpoint(endpoint)
        .then((verified) => {
          if (verified) {
            localStorage.setItem('stats-endpoint', endpoint);
            setConnectedEndpoint(endpoint);
          }
        })
        .catch((e) => {
          setEndpointUserInput(connectedEndpoint);
        });
    },
    [connectedEndpoint, setConnectedEndpoint]
  );

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
    <Dropdown ref={ref}>
      <DropdownBasicButton icon={icon} size='sm' dropdownButton={false} />
      <DropdownBody className='mt-5' size='sm' onFocusOutside={async () => await setEndpoint(endpointUserInput)}>
        <div className='px-4 py-2'>
          <Typography variant={'h4'}>Settings</Typography>
          <ThemeSwitcherItem className='px-0' />
          <MenuItem icon={<OpenBook size='lg' />} className='px-0'>
            Docs
          </MenuItem>
          <Collapsible>
            <CollapsibleButton className='px-0'>Advanced</CollapsibleButton>
            <CollapsibleContent className='p-1'>
              <div className='flex justify-between pb-2'>
                <Label className='body2' htmlFor='endpoint-switcher-input'>
                  Custom Data Source
                </Label>
                <Button
                  variant='link'
                  size='sm'
                  onClick={() => {
                    setEndpointUserInput(defaultEndpoint);
                    setConnectedEndpoint(defaultEndpoint);
                  }}
                >
                  Reset
                </Button>
              </div>
              <Input
                id={'endpoint-switcher-input'}
                value={endpointUserInput}
                onChange={(val) => setEndpointUserInput(val.toString())}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DropdownBody>
    </Dropdown>
  );
});
