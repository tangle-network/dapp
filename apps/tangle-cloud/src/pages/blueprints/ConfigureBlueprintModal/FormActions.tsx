import Button from '@tangle-network/ui-components/components/buttons/Button';
import { ModalFooter } from '@tangle-network/ui-components/components/Modal';
import { OPERATOR_RPC_URL } from '../../../constants/links';

const FormActions = () => {
  return (
    <ModalFooter className="px-0">
      <Button
        href={OPERATOR_RPC_URL}
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
};

export default FormActions;
