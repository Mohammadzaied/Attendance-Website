// components/PageSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function LoadingPage({
  label = "جاري التحميل...",
}: {
  label?: string;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
