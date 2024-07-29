import { redirect } from 'next/navigation';

import { PagePath } from '../../types';

export default function RestakePage() {
  // Default redirect to deposit page
  return redirect(PagePath.RESTAKE_DEPOSIT);
}
