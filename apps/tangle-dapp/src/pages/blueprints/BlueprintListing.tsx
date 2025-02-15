import BlueprintGallery from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useBlueprintListing from '@tangle-network/tangle-shared-ui/data/blueprints/useBlueprintListing';
import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router';
import { PagePath } from '../../types';

const BlueprintItemWrapper = ({
  children,
  id,
}: PropsWithChildren<{ id: string }>) => {
  return <Link to={`${PagePath.BLUEPRINTS}/${id}`}>{children}</Link>;
};

const BlueprintListing: FC = () => {
  const { blueprints, isLoading, error } = useBlueprintListing();

  return (
    <BlueprintGallery
      blueprints={Object.values(blueprints).map((blueprint) => ({
        ...blueprint,
        renderImage(imageUrl) {
          return (
            <img
              src={imageUrl}
              width={72}
              height={72}
              alt={blueprint.name}
              className="flex-shrink-0 bg-center rounded-full"
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
