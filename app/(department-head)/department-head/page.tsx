"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";

export default function DepartmentHeadPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/department-head/entry");
  }, [router]);

  return <LoadingPage />;
}
