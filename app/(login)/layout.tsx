"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/shared/LoadingPage";
import { roleToRoute } from "@/Config/roles";
import { useEffect, useState } from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isInitializing, user } = useAppSelector(
    (state) => state.AuthSlice,
  );

  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    // Only run after initialization
    if (!isInitializing) {
      if (isAuthenticated && user?.roleName) {
        const route = roleToRoute[user.roleName.toLowerCase()] || "/";
        // Redirect immediately
        router.replace(route);
      } else {
        // Not authenticated → allow login page to render
        setCanRender(true);
      }
    }
  }, [isAuthenticated, user, isInitializing, router]);

  // While initializing or redirecting → show loading
  if (isInitializing || (isAuthenticated && !canRender)) {
    return <LoadingPage />;
  }

  // Only render login page if user is not authenticated
  if (!isAuthenticated && canRender) {
    return <>{children}</>;
  }

  // Fallback (should never happen)
  return <LoadingPage />;
}
