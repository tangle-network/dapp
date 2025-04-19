import { createApi, getRandomShortId, submitTx } from './util';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const BLUEPRINTS_COUNT = 10;

(async () => {
  const api = await createApi();

  // 1. Setup blueprint service manager. This is required to create blueprints.
  await submitTx({
    description: 'setup blueprint service manager',
    tx: api.tx.services.updateMasterBlueprintServiceManager(ZERO_ADDRESS),
    useSudo: true,
  });

  const createBlueprint = () => {
    const id = getRandomShortId();

    return api.tx.services.createBlueprint({
      metadata: {
        name: `blueprint ${id}`,
        description: 'This is a test blueprint.',
        author: 'Tangle Network',
        category: 'test',
        license: 'MIT',
      },
    });
  };

  // 2. Create blueprints in a batch.
  await submitTx({
    description: 'create blueprints',
    tx: api.tx.utility.batch(
      Array.from({ length: BLUEPRINTS_COUNT }, createBlueprint),
    ),
  });

  await api.disconnect();
})();
