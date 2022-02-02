import { getEVMChainName, WebbEVMChain } from '@webb-dapp/apps/configs';
import { InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/utils/webb-error';

export function unsupportedChain(): InteractiveFeedback {
  let interactiveFeedback: InteractiveFeedback;
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: 'Switched to unsupported chain',
    },
    {
      content: 'Please consider switching back to a supported chain',
    },
    {
      list: [
        getEVMChainName(WebbEVMChain.Rinkeby),
        getEVMChainName(WebbEVMChain.Beresheet),
        getEVMChainName(WebbEVMChain.HarmonyTestnet1),
      ],
    },
    {
      content: 'Switch back via MetaMask',
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
