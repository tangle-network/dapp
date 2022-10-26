import { Button } from '@mui/material';
import { InteractiveFeedback, WebbErrorCodes } from '@nepoche/dapp-types';
import { TAppEvent } from '../../app-event';
import { notificationApi } from '@nepoche/ui-components/notification';
import React from 'react';

type EvmNetworkConflictParams = {
  intendedChain: string;
  selectedChain: string;
  switchChain?(): void;
};

export const USER_SWITCHED_TO_EXPECT_CHAIN = 'OK';

export function evmChainConflict(params: EvmNetworkConflictParams, appEvent: TAppEvent): InteractiveFeedback {
  let interactiveFeedback: InteractiveFeedback;
  const addChainContent = [
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
            params.switchChain?.();
            clicked = true;
          },
          children: `Switch to ${params.intendedChain}`,
          variant: 'contained',
          color: 'primary',
        });
      },
    },
  ];
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `You must switch networks`,
    },

    {
      content: `The selected chain is ${params.selectedChain};
       however the note is intended for ${params.intendedChain}`,
    },
    ...(params.switchChain ? addChainContent : []),
  ]);
  const actions = InteractiveFeedback.actionsBuilder()
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
    WebbErrorCodes.UnselectedChain
  );
  return interactiveFeedback;
}
