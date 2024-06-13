import { redirect } from 'next/navigation';

export default function RestakePage() {
  // Default redirect to deposit page
  return redirect('/restake/deposit');
}
