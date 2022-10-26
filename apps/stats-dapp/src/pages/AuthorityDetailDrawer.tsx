import { Drawer, DrawerContent } from '@nepoche/webb-ui-components/components';
import { useNavigate } from 'react-router-dom';

import { AuthorityDetail } from '../containers';

const AuthorityDetailDrawer = () => {
  const nagivate = useNavigate();

  return (
    <Drawer defaultOpen onOpenChange={(isOpen) => !isOpen && nagivate('/authorities')}>
      <DrawerContent>
        <AuthorityDetail />
      </DrawerContent>
    </Drawer>
  );
};

export default AuthorityDetailDrawer;
