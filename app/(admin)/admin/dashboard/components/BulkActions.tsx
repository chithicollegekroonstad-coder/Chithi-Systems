// app/admin/dashboard/components/BulkActions.tsx
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onBulkFreeze: () => void;
  onBulkUnfreeze: () => void;
  hasFrozen: boolean;
}

export function BulkActions({
  selectedCount,
  onBulkFreeze,
  onBulkUnfreeze,
  hasFrozen,
}: BulkActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        variant="outline"
        onClick={onBulkFreeze}
        disabled={selectedCount === 0}
      >
        Bulk Freeze Selected
      </Button>
      <Button
        variant="outline"
        onClick={onBulkUnfreeze}
        disabled={selectedCount === 0}
      >
        Bulk Unfreeze Selected
      </Button>
      <Button variant="outline" disabled={!hasFrozen}>
        <Download className="mr-2 h-4 w-4" /> Export Frozen List
      </Button>
    </div>
  );
}
