import Button from '@tangle-network/webb-ui-components/components/buttons/Button';
import { ModalFooter } from '@tangle-network/webb-ui-components/components/Modal';
import { OPERATOR_PRICING_URL } from '../../../constants/links';

export default function FormActions() {
  return (
    <ModalFooter className="px-0">
      <Button
        href={OPERATOR_PRICING_URL}
        target="_blank"
        className="flex-1 max-w-none"
        variant="secondary"
      >
        Learn More
      </Button>

      <Button className="flex-1 max-w-none" type="submit">
        Save
      </Button>
    </ModalFooter>
  );
}
