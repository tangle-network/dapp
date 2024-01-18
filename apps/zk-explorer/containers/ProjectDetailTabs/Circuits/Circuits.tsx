import { fetchProjectFileTree } from '../../../server/projectDetails';
import CircuitsClient from './client';

export default async function Circuits() {
  const circuitFilesData = await fetchProjectFileTree();

  return <CircuitsClient fileTree={circuitFilesData} />;
}
