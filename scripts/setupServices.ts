import { createApi, submitTx } from './util';

(async () => {
  const api = await createApi();

  const createBlueprint = async () => {
    const tx = api.tx.staking.bondExtra(BigInt('1000000000000000000'));

    await submitTx('create blueprint', tx);
  };

  await createBlueprint();
})();
