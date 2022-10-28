import {
  Drawer,
  DrawerContent,
} from '@webb-tools/webb-ui-components/components';
import { useNavigate } from 'react-router-dom';

import { KeyDetail } from '../containers';

const KeyDetailDrawer = () => {
  const nagivate = useNavigate();

  return (
    <Drawer defaultOpen onOpenChange={(isOpen) => !isOpen && nagivate('/keys')}>
      <DrawerContent>
        <KeyDetail />
      </DrawerContent>
    </Drawer>
  );
};

export default KeyDetailDrawer;
