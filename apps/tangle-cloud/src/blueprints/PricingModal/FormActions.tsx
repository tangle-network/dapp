import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ModalFooter } from '@webb-tools/webb-ui-components/components/Modal';
import { OPERATOR_PRICING_URL } from '../../constants/links';

export default function FormActions() {
  return (
    <ModalFooter>
      <Button variant="link" href={OPERATOR_PRICING_URL} target="_blank">
        Learn more about pricing
      </Button>
      <Button type="submit">Next</Button>
    </ModalFooter>
  );
}
