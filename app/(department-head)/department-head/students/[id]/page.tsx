"use client";

import { use } from "react";
import { StudentProfileContent } from "@/components/admin/studentTab/student-profile-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DHStudentProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const studentId = Number(resolvedParams.id);

  return <StudentProfileContent role="department-head" studentId={studentId} />;
}
