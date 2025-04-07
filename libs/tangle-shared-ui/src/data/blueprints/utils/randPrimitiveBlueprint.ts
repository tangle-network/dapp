import { randFullName } from '@ngneat/falso';
import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';

function randPrimitiveBlueprint(
  id: bigint,
): ReturnType<typeof toPrimitiveBlueprint> {
  return {
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
    gadget: {
      sources: [
        {
          fetcher: {
            ContainerImage: {
              registry_: `https://example.com/registry-${id.toString()}`,
              image: `https://example.com/image-${id.toString()}`,
              tag: `latest`,
            },
          },
        },
      ],
    },
  };
}

export default randPrimitiveBlueprint;
