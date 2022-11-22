import { ApiConfig } from '@webb-tools/dapp-config';
import {
  EVMChainId,
  InteractiveFeedback,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';

export function unsupportedChain(apiConfig: ApiConfig): InteractiveFeedback {
  const feedbackBody = InteractiveFeedback.feedbackEntries([
    {
      header: 'Switched to unsupported chain',
    },
    {
      content: 'Please consider switching back to a supported chain',
    },
    {
      list: [
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
  const interactiveFeedback = new InteractiveFeedback(
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
