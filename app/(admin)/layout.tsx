// "use client";

// import { notFound, usePathname, useRouter } from "next/navigation";
// import LoadingPage from "@/components/shared/LoadingPage";
// import { NavHeader } from "@/components/shared/nav-header";
// import { RootState } from "@/store/store";
// import { useAppSelector } from "@/store/hooks";
// import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
// import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";
// import { cn } from "@/lib/utils";
// import { useEffect, useMemo, useState } from "react";

// function LayoutContent({ children }: { children: React.ReactNode }) {
//   const { isOpen: isSidebarOpen, setSidebarItems } = useSidebar();
//   const pathname = usePathname();

//   const activeSection = useMemo(() => {
//     if (pathname.includes("/admin/majors")) return "majors";
//     if (pathname.includes("/admin/students")) return "students";
//     if (pathname.includes("/admin/teachers")) return "teachers";
//     if (pathname.includes("/admin/warnings")) return "warnings";
//     return "majors";
//   }, [pathname]);

//   const adminItems = useAdminSidebarItems(activeSection);

//   useEffect(() => {
//     setSidebarItems(adminItems);
//   }, [setSidebarItems]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <NavHeader items={[]} />
//       <div className=" flex">
//         <main
//           className={cn(
//             "flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 transition-all duration-300",
//             isSidebarOpen ? "lg:mr-64" : "lg:mr-20",
//           )}
//         >
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const { isAuthenticated, isInitializing, user } = useAppSelector(
//     (state: RootState) => state.AuthSlice,
//   );

//   const [canRender, setCanRender] = useState(false);

//   useEffect(() => {
//     if (!isInitializing) {
//       if (!isAuthenticated) {
//         router.replace("/login");
//       } else if (user?.roleName?.toLowerCase() !== "admin") {
//         notFound();
//       } else {
//         setCanRender(true);
//       }
//     }
//   }, [isAuthenticated, isInitializing, user, router]);

//   if (isInitializing || !canRender) {
//     return <LoadingPage />;
//   }

//   return (
//     <SidebarProvider>
//       <LayoutContent>{children}</LayoutContent>
//     </SidebarProvider>
//   );
// }

"use client";

import { notFound, redirect, usePathname } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";
import { NavHeader } from "@/components/shared/nav-header";
import { RootState } from "@/store/store";
import { useAppSelector } from "@/store/hooks";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen: isSidebarOpen, setSidebarItems } = useSidebar();
  const pathname = usePathname();

  const activeSection = useMemo(() => {
    if (pathname.includes("/admin/majors")) return "majors";
    if (pathname.includes("/admin/students")) return "students";
    if (pathname.includes("/admin/teachers")) return "teachers";
    if (pathname.includes("/admin/warnings")) return "warnings";
    if (pathname.includes("/admin/analytics")) return "analytics";
    return "majors";
  }, [pathname]);

  const adminItems = useAdminSidebarItems(activeSection);

  useEffect(() => {
    setSidebarItems(adminItems);
  }, [adminItems, setSidebarItems]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader items={[]} />
      <div className="flex">
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

  if (user?.roleName?.toLowerCase() !== "admin" || !isAuthenticated) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
