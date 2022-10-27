import { InteractiveFeedback, WebbErrorCodes } from '@nepoche/dapp-types';
import { TAppEvent } from '../../app-event';

export function insufficientApiInterface(appEvent: TAppEvent): InteractiveFeedback {
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `The active API isn't providing the expected functionality`,
    },
    {
      content: 'Please consider switching back to a another chain',
    },
  ]);
  const interactiveFeedback = new InteractiveFeedback(
    'error',
    InteractiveFeedback.actionsBuilder()
      .action(
        'Switch',
        () => {
          interactiveFeedback?.cancelWithoutHandler();
          appEvent.send('changeNetworkSwitcherVisibility', true);
        },
        'success'
      )
      .actions(),
    () => {
      interactiveFeedback?.cancel();
    },
    feedbackBody,
    WebbErrorCodes.UnsupportedChain
  );
  return interactiveFeedback;
}
