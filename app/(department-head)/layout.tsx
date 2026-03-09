"use client";

import { notFound, redirect, usePathname, useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";
import { RootState } from "@/store/store";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useMemo, useState } from "react";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { useDepartmentHeadSidebarItems } from "@/lib/utils/sidebar-items";
import { NavHeader } from "@/components/shared/nav-header";
import { cn } from "@/lib/utils";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen: isSidebarOpen, setSidebarItems } = useSidebar();
  const pathname = usePathname();

  const activeSection = useMemo(() => {
    if (pathname.includes("/department-head/absences")) return "absences";
    if (pathname.includes("/department-head/subjects")) return "subjects";
    if (pathname.includes("/department-head/students")) return "students";
    if (pathname.includes("/department-head/warnings")) return "warnings";
    if (pathname.includes("/department-head/specializations")) return "specializations";
    if (pathname.includes("/department-head/entry")) return "entry";
    return "entry";
  }, [pathname]);

  const dhItems = useDepartmentHeadSidebarItems(activeSection);

  useEffect(() => {
    setSidebarItems(dhItems);
  }, [dhItems, setSidebarItems]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader items={[]} />
      <div className="flex">
        <main
          className={cn(
            "flex-1 min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 transition-all duration-300",
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

  if (user?.roleName?.toLowerCase() !== "department-head" || !isAuthenticated) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
