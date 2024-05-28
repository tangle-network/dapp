import InfoCard from './InfoCard';
import ParticipantsTable from './ParticipantsTable';
import PermittedCaller from './PermittedCaller';

export default function ServiceDetails({
  params,
}: {
  params: { serviceId: string };
}) {
  const { serviceId } = params;

  return (
    <div className="space-y-5">
      <InfoCard serviceId={serviceId} />

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-5">
        <PermittedCaller className="lg:min-h-[600px] md:flex-[3] min-w-0" />

        <ParticipantsTable className="lg:min-h-[600px] md:flex-[2]" />
      </div>
    </div>
  );
}
