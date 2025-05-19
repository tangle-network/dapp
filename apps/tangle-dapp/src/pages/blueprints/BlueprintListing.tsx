import BlueprintGallery from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery';
import useAllBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useAllBlueprints';
import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router';
import { PagePath } from '../../types';

const BlueprintItemWrapper: FC<PropsWithChildren<{ id: bigint }>> = ({
  children,
  id,
}) => {
  return <Link to={`${PagePath.BLUEPRINTS}/${id.toString()}`}>{children}</Link>;
};

const BlueprintListing: FC = () => {
  const { blueprints, isLoading, error } = useAllBlueprints();

  const blueprintsArray = Array.isArray(blueprints)
    ? blueprints
    : Array.from(blueprints?.values() || []);

  return (
    <BlueprintGallery
      blueprints={blueprintsArray.map((blueprint) => ({
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
