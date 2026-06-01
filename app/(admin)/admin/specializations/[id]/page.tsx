"use client";

import { SpecializationDetailPage } from "@/components/department-head/specialization-absences/SpecializationDetailPage";
import { use } from "react";

export default function DHSpecializationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SpecializationDetailPage specializationId={Number(id)} />;
}
