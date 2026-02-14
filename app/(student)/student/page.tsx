"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";

export default function StudentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/absences");
  }, [router]);

  return (
    <LoadingPage />

    // <div className="flex items-center justify-center h-screen">
    //   <div className="animate-pulse text-blue-600 font-medium">
    //     جاري التحميل...
    //   </div>
    // </div>
  );
}
