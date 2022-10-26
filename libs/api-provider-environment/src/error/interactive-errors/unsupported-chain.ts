import { ApiConfig } from '@nepoche/dapp-config';
import { EVMChainId, InteractiveFeedback, WebbErrorCodes } from '@nepoche/dapp-types';

export function unsupportedChain(apiConfig: ApiConfig): InteractiveFeedback {
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
        apiConfig.getEVMChainName(EVMChainId.Rinkeby),
        apiConfig.getEVMChainName(EVMChainId.Beresheet),
        apiConfig.getEVMChainName(EVMChainId.HarmonyTestnet1),
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
