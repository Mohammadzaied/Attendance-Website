"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";

export default function TeacherPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/entry");
  }, [router]);

  return <LoadingPage />;
}
