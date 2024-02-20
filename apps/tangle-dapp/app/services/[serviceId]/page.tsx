import DetailTabs from './DetailTabs';
import ParticipantsTable from './ParticipantsTable';

export default function ServiceDetails({
  params,
}: {
  params: { serviceId: string };
}) {
  const { serviceId } = params;
  return (
    <div className="space-y-5">
      {/* Service Info Card */}

      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Tabs */}
        <DetailTabs
          serviceId={serviceId}
          className="lg:min-h-[600px] md:flex-[3]"
        />

        {/* Participants Table */}
        <ParticipantsTable
          serviceId={serviceId}
          className="lg:min-h-[600px] md:flex-[2]"
        />
      </div>
    </div>
  );
}
