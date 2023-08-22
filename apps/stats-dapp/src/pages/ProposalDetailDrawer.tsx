import {
  Drawer,
  DrawerContent,
} from '@webb-tools/webb-ui-components/components';
import { useNavigate } from 'react-router-dom';
import { ProposalDetail } from '../containers';
import { useEffect } from 'react';

const ProposalDetailDrawer = () => {
  const nagivate = useNavigate();

  return (
    <Drawer
      defaultOpen
      onOpenChange={(isOpen) => !isOpen && nagivate('/proposals')}
    >
      <DrawerContent>
        <ProposalDetail />
      </DrawerContent>
    </Drawer>
  );
};

export default ProposalDetailDrawer;
