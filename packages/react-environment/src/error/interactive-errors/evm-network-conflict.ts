import { Button } from '@material-ui/core';
import { TAppEvent } from '@webb-dapp/react-environment/app-event';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import React from 'react';

type EvmNetworkConflictParams = {
  activeOnExtension: {
    name: string;
    id: string | number;
  };
  selected: {
    name: string;
    id: string | number;
  };
  addEvmChainToMetaMask?(): void;
};

export const USER_SWITCHED_TO_EXPECT_CHAIN = 'OK';

export function evmChainConflict(params: EvmNetworkConflictParams, appEvent: TAppEvent): InteractiveFeedback {
  let interactiveFeedback: InteractiveFeedback;
  const addChainContent = [
    {
      content: `If you don't have ${params.selected.name} in your MetaMask extension`,
    },
    {
      any: () => {
        let clicked = false;
        return React.createElement(Button, {
          onClick: () => {
            if (clicked) {
              notificationApi({
                message: 'Please approve on the extension',
                secondaryMessage: 'The network adding request sent to extension please approve it',
                variant: 'warning',
                key: 'add-new-network',
              });
              return;
            }
            params.addEvmChainToMetaMask?.();
            clicked = true;
          },
          children: `Add ${params.selected.name}`,
          variant: 'contained',
          color: 'primary',
        });
      },
    },
  ];
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `The select chain isn't active on MetaMask`,
    },

    {
      content: `The selected chain is ${params.selected.name} with id (${params.selected.id})
      ;However the active on metamask is ${params.activeOnExtension.name} with id ${params.activeOnExtension.id}`,
    },
    {
      content: `To continue using ${params.selected.name}`,
    },
    {
      list: ['Open MetaMask', `select chain ${params.selected.name}`],
    },
    ...(params.addEvmChainToMetaMask ? addChainContent : []),
  ]);
  const actions = InteractiveFeedback.actionsBuilder()
    // .action(
    //   'Ok,I switched',
    //   () => {
    //     console.log('Ok,I switched');
    //     interactiveFeedback?.cancelWithoutHandler();
    //   },
    //   'success',
    //   USER_SWITCHED_TO_EXPECT_CHAIN
    // )
    .action(
      'Reselect chain',
      () => {
        interactiveFeedback?.cancelWithoutHandler();
        appEvent.send('changeNetworkSwitcherVisibility', true);
      },
      'info'
    )
    .actions();
  interactiveFeedback = new InteractiveFeedback(
    'error',
    actions,
    () => {
      interactiveFeedback?.cancelWithoutHandler();
    },
    feedbackBody,
    WebbErrorCodes.UnsupportedChain
  );
  return interactiveFeedback;
}
