import { Drawer, DrawerContent } from '@webb-dapp/webb-ui-components/components';
import React, { useState } from 'react';
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
