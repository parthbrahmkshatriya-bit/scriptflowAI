import LoadingDoodle from "@/components/ui/LoadingDoodle";

export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingDoodle title="Loading dashboard…" subtitle="Fetching your scripts and stats" size="lg" />
    </div>
  );
}
