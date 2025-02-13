import { redirect } from 'next/navigation';
import { PagePath } from '../types';

export default async function Index() {
  redirect(PagePath.BLUEPRINTS);
}
