"use client";

import { use } from "react";
import { StudentAbsencesContent } from "@/components/teacher/student-absences-content";

interface PageProps {
  params: Promise<{
    subjectId: string;
    studentId: string;
  }>;
}

export default function StudentAbsencesPage({ params }: PageProps) {
  const { subjectId, studentId } = use(params);

  return (
    <StudentAbsencesContent
      role="teacher"
      subjectId={subjectId}
      studentId={studentId}
    />
  );
}
