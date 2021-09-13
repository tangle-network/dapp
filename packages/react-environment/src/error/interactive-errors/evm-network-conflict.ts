import { TAppEvent } from '@webb-dapp/react-environment/app-event';
import { InteractiveFeedback, UnselectedNetworkError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Button } from '@material-ui/core';
import React from 'react';
import { notificationApi } from '@webb-dapp/ui-components/notification';

export const USER_SWITCHED_TO_EXPECT_CHAIN = 'OK';

export function evmChainConflict(
  unselectedNetworkError: UnselectedNetworkError,
  appEvent: TAppEvent
): InteractiveFeedback {
  let interactiveFeedback: InteractiveFeedback;
  const switchChainContent = [
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
            unselectedNetworkError.switchChain();
            clicked = true;
          },
          children: `Switch to ${unselectedNetworkError.getIntendedChain().name}`,
          variant: 'contained',
          color: 'primary',
        });
      },
    },
  ];
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `You must change networks`,
    },

    {
      content: `It looks like you want to use ${unselectedNetworkError.getIntendedChain().name} with id (${
        unselectedNetworkError.getIntendedChain().id
      });
       however the selected chain is ${unselectedNetworkError.getActiveChain().name} with id ${
        unselectedNetworkError.getActiveChain().id
      }`,
    },
    ...switchChainContent,
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
    WebbErrorCodes.UnselectedChain
  );
  return interactiveFeedback;
}
