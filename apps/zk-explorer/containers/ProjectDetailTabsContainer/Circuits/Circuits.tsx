import CircuitsClient from './client';

import { getProjectCircuitsData } from '../../../server';

export default async function Circuits() {
  const circuitFilesData = await getProjectCircuitsData();

  return <CircuitsClient data={circuitFilesData} />;
}
