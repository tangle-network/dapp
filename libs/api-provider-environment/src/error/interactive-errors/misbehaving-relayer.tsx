import { InteractiveFeedback, WebbErrorCodes } from '@nepoche/dapp-types';

export function misbehavingRelayer(): InteractiveFeedback {
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: `Bad Relayer`,
    },
    {
      content: 'The selected relayer is not operating properly. Please select a different relayer.',
    },
  ]);
  const actions = InteractiveFeedback.actionsBuilder()
    .action(
      'Ok',
      () => {
        interactiveFeedback?.cancelWithoutHandler();
      },
      'success'
    )
    .actions();
  const interactiveFeedback = new InteractiveFeedback(
    'error',
    actions,
    () => {
      interactiveFeedback?.cancel();
    },
    feedbackBody,
    WebbErrorCodes.RelayerMisbehaving
  );
  return interactiveFeedback;
}
