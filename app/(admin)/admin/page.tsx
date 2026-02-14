"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/majors");
  }, [router]);

  return <LoadingPage />;
}
