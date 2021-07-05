import { WebbEVMChain } from '@webb-dapp/apps/configs';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3';
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
        WebbWeb3Provider.storageName(WebbEVMChain.Rinkeby),
        WebbWeb3Provider.storageName(WebbEVMChain.Beresheet),
        WebbWeb3Provider.storageName(WebbEVMChain.EthereumMainNet),
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
