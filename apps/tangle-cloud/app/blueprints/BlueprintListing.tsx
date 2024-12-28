'use client';

import BlueprintGallery from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useBlueprintListing from '@webb-tools/tangle-shared-ui/data/blueprints/useFakeBlueprintListing';
import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';
import Link from 'next/link';
import { PagePath } from '../../types';

const BlueprintItemWrapper = ({
  children,
  id,
}: PropsWithChildren<{ id: string }>) => {
  return <Link href={`${PagePath.BLUEPRINTS}/${id}`}>{children}</Link>;
};

const BlueprintListing: FC = () => {
  const { blueprints, isLoading, error } = useBlueprintListing();

  return (
    <BlueprintGallery
      blueprints={blueprints.map((blueprint) => ({
        ...blueprint,
        renderImage(imageUrl) {
          return (
            <Image
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
      BlueprintItemWrapper={BlueprintItemWrapper}
    />
  );
};

export default BlueprintListing;
