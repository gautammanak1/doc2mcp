import { SkeletonHeader, SkeletonTable } from "@/components/ui/page-skeleton";

export default function AdminSubscriptionsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader subtitle />
      <SkeletonTable columns={7} rows={10} />
    </div>
  );
}
