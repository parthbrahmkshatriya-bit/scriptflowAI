import LoadingDoodle from "@/components/ui/LoadingDoodle";

export default function GenerateLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingDoodle title="Loading generator…" subtitle="Getting everything ready" size="lg" />
    </div>
  );
}
