import { AppConfig, EVMChainId, getEVMChainName, InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/api-providers';

export function unsupportedChain(appConfig: AppConfig): InteractiveFeedback {
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
        getEVMChainName(appConfig, EVMChainId.Rinkeby),
        getEVMChainName(appConfig, EVMChainId.Beresheet),
        getEVMChainName(appConfig, EVMChainId.HarmonyTestnet1),
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
