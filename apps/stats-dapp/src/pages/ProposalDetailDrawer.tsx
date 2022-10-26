import { Drawer, DrawerContent } from '@nepoche/webb-ui-components/components';
import { useNavigate } from 'react-router-dom';

import { ProposalDetail } from '../containers';

const ProposalDetailDrawer = () => {
  const nagivate = useNavigate();

  return (
    <Drawer defaultOpen onOpenChange={(isOpen) => !isOpen && nagivate('/proposals')}>
      <DrawerContent>
        <ProposalDetail />
      </DrawerContent>
    </Drawer>
  );
};

export default ProposalDetailDrawer;
