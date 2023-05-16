import { InteractiveFeedback, WebbErrorCodes } from '@webb-tools/dapp-types';
import { Button, notificationApi } from '@webb-tools/webb-ui-components';
import React from 'react';
import { TAppEvent } from '../../app-event';

type EvmNetworkConflictParams = {
  intendedChain: string;
  selectedChain: string;
  switchChain?(): void;
};

export const USER_SWITCHED_TO_EXPECT_CHAIN = 'OK';

export function evmChainConflict(
  params: EvmNetworkConflictParams,
  appEvent: TAppEvent
): InteractiveFeedback {
  const addChainContent = [
    {
      any: () => {
        let clicked = false;
        return React.createElement(Button, {
          onClick: () => {
            if (clicked) {
              notificationApi({
                message: 'Please approve on the extension',
                secondaryMessage:
                  'The network adding request sent to extension please approve it',
                variant: 'warning',
                key: 'add-new-network',
              });
              return;
            }
            params.switchChain?.();
            clicked = true;
          },
          children: `Switch to ${params.intendedChain}`,
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
  const interactiveFeedback = new InteractiveFeedback(
    'error',
    InteractiveFeedback.actionsBuilder()
      .action(
        'Reselect chain',
        () => {
          appEvent.send('changeNetworkSwitcherVisibility', true);
        },
        'info'
      )
      .actions(),
    () => {
      interactiveFeedback?.cancelWithoutHandler();
    },
    feedbackBody,
    WebbErrorCodes.UnselectedChain
  );
  return interactiveFeedback;
}
