"use client";

import { notFound, redirect, usePathname, useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";
import { NavHeader } from "@/components/shared/nav-header";
import { RootState } from "@/store/store";
import { useAppSelector } from "@/store/hooks";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { useTeacherSidebarItems } from "@/lib/utils/sidebar-items";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen: isSidebarOpen, setSidebarItems } = useSidebar();
  const pathname = usePathname();

  const activeSection = useMemo(() => {
    if (pathname.includes("/teacher/absences")) return "absences";
    if (pathname.includes("/teacher/subjects")) return "subjects";
    if (pathname.includes("/teacher/entry")) return "entry";
    return "entry";
  }, [pathname]);

  const teacherItems = useTeacherSidebarItems(activeSection);

  useEffect(() => {
    setSidebarItems(teacherItems);
  }, [teacherItems, setSidebarItems]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader items={[]} />
      <div className=" flex">
        <main
          className={cn(
            "flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 transition-all duration-300",
            isSidebarOpen ? "lg:mr-64" : "lg:mr-20",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isInitializing, user } = useAppSelector(
    (state: RootState) => state.AuthSlice,
  );

  if (isInitializing) {
    return <LoadingPage />;
  }

  if (user?.roleName?.toLowerCase() !== "teacher" || !isAuthenticated) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
