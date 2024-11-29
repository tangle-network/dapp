'use client';

import BlueprintGallery from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useBlueprintListing from '@webb-tools/tangle-shared-ui/data/blueprints/useBlueprintListing';
import { FC } from 'react';

import { PagePath } from '../../types';

const BlueprintListing: FC = () => {
  const { blueprints, isLoading, error } = useBlueprintListing();

  return (
    <BlueprintGallery
      blueprints={blueprints.map((blueprint) => ({
        ...blueprint,
        renderImage(imageUrl) {
          return (
            <img
              src={imageUrl}
              width={72}
              height={72}
              alt={blueprint.name}
              className="flex-shrink-0 bg-center rounded-full"
              fill={false}
            />
          );
        },
      }))}
      isLoading={isLoading}
      error={error}
      getBlueprintUrl={(blueprint) => `${PagePath.BLUEPRINTS}/${blueprint.id}`}
    />
  );
};

export default BlueprintListing;
