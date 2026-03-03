import { randFullName } from '@ngneat/falso';
import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';

const randPrimitiveBlueprint = (
  id: bigint,
): ReturnType<typeof toPrimitiveBlueprint> => {
  return {
    id,
    metadata: {
      name: `Blueprint ${id.toString()}`,
      description: `Description for Blueprint ${id.toString()}`,
      author: randFullName(),
      category: `Category ${id.toString()}`,
      codeRepository: `https://github.com/blueprint-${id.toString()}`,
      logo: `https://dummyimage.com/100x100`,
      website: `https://example.com/blueprint-${id.toString()}`,
      license: `MIT`,
    },
    jobs: [],
    registrationParams: [],
    requestParams: [],
  };
};

export default randPrimitiveBlueprint;
