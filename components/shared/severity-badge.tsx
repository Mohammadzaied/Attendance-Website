"use client";

import { Badge } from "@/components/ui/badge";

export type Severity = "low" | "medium" | "high";

export function SeverityBadge({ severity }: { severity: Severity }) {
  switch (severity) {
    case "high":
      return <Badge variant="destructive">عالي</Badge>;
    case "medium":
      return <Badge className="bg-warning hover:bg-warning-foreground">متوسط</Badge>;
    case "low":
      return <Badge variant="secondary">منخفض</Badge>;
    default:
      return null;
  }
}
