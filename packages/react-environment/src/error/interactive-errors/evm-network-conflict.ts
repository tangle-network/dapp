import { InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { TAppEvent } from '@webb-dapp/react-environment/app-event';

type EvmNetworkConflictParams = {
  activeOnExtension: {
    name: string;
    id: string | number;
  };
  selected: {
    name: string;
    id: string | number;
  };
};

export const USER_SWITCHED_TO_EXPECT_CHAIN = 'OK';
export function evmChainConflict(params: EvmNetworkConflictParams, appEvent: TAppEvent): InteractiveFeedback {
  let interactiveFeedback: InteractiveFeedback;
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `The select chain isn't active on MetaMask`,
    },

    {
      content: `The selected chain of ${params.selected.name} with id (${params.selected.id})
      ;However the active on metamask is ${params.activeOnExtension.name} with id ${params.activeOnExtension.id}`,
    },
    {
      content: 'Switch back via MetaMask',
    },
  ]);
  const actions = InteractiveFeedback.actionsBuilder()
    .action(
      'Ok,I switched',
      () => {
        interactiveFeedback?.cancelWithoutHandler();
      },
      'success',
      USER_SWITCHED_TO_EXPECT_CHAIN
    )
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
      interactiveFeedback?.cancel();
    },
    feedbackBody,
    WebbErrorCodes.UnsupportedChain
  );
  return interactiveFeedback;
}
