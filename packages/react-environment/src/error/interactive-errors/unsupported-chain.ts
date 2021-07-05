import { WebbEVMChain } from '@webb-dapp/apps/configs';
import { getStorageName } from '@webb-dapp/apps/configs/storages/EvmChainStorage';
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
        getStorageName(WebbEVMChain.Rinkeby),
        getStorageName(WebbEVMChain.Beresheet),
        getStorageName(WebbEVMChain.EthereumMainNet),
        getStorageName(WebbEVMChain.HarmonyTest1),
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
