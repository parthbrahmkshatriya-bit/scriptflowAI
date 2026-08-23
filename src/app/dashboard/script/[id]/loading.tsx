import LoadingDoodle from "@/components/ui/LoadingDoodle";

export default function ScriptLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingDoodle title="Loading script…" subtitle="Fetching your scenes" size="lg" />
    </div>
  );
}
