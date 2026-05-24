import { SkeletonHeader, SkeletonTable } from "@/components/ui/page-skeleton";

export default function AdminPaymentsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader subtitle />
      <SkeletonTable columns={5} rows={8} />
    </div>
  );
}
