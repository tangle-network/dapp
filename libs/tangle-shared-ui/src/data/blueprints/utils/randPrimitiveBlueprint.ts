import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';

function randPrimitiveBlueprint(
  id: number,
): ReturnType<typeof toPrimitiveBlueprint> {
  return {
    metadata: {
      name: `Blueprint ${id}`,
      description: `Description for Blueprint ${id}`,
      author: `Author ${id}`,
      category: `Category ${id}`,
      codeRepository: `https://github.com/blueprint-${id}`,
      logo: `https://dummyimage.com/100x100`,
      website: `https://example.com/blueprint-${id}`,
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
              registry_: `https://example.com/registry-${id}`,
              image: `https://example.com/image-${id}`,
              tag: `latest`,
            },
          },
        },
      ],
    },
  };
}

export default randPrimitiveBlueprint;
