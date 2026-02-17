"use client";

import { use } from "react";
import { StudentAbsencesContent } from "@/components/teacher/student-absences-content";

interface PageProps {
  params: Promise<{
    subjectId: string;
    studentId: string;
  }>;
}

export default function DHStudentAbsencesPage({ params }: PageProps) {
  const { subjectId, studentId } = use(params);

  return (
    <StudentAbsencesContent
      role="department-head"
      subjectId={subjectId}
      studentId={studentId}
    />
  );
}
