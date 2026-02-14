"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSidebar } from "./dashboard-sidebar";
import { AlignJustify, Ellipsis, Settings, UserRoundCog } from "lucide-react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/features/auth";
import { roleMap } from "@/Config/roles";
import { ChangePasswordDialog } from "./change-password-dialog";
import { SystemSettingsDialog } from "../admin/SettingsAdmin/system-settings-dialog";
import { UpdateAdminDialog } from "../admin/SettingsAdmin/update-admin-dialog";
import { useState } from "react";
import Link from "next/link";
import { LessonsManagementDialog } from "../admin/SettingsAdmin/lessons-management-dialog";

type SidebarItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  isActive?: boolean;
};

type NavSidebarProps = {
  items: SidebarItem[];
};
export function NavHeader({ items: propsItems }: NavSidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.AuthSlice);
  const {
    isOpen: isSidebarOpen,
    toggle: toggleSidebar,
    isMobile,
    sidebarItems: contextItems,
  } = useSidebar();

  const items = propsItems && propsItems.length > 0 ? propsItems : contextItems;
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [adminProfileOpen, setAdminProfileOpen] = useState(false);

  const getRoleLabel = (roleName: string) => {
    return roleMap[roleName] || roleName;
  };

  const handleLogout = async () => {
    await dispatch(signOut());
    router.push("/login");
  };

  return (
    <header className="sticky top-0  border-b bg-white shadow-lg z-50">
      <DashboardSidebar items={items} />
      <div className="px-2 sm:px-4 py-3 sm:py-4 w-full flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-10 w-10 border-2 cursor-pointer shrink-0"
        >
          {isSidebarOpen && !isMobile ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <AlignJustify className="h-5 w-5" />
          )}
        </Button>
        <Link href="/login">
          <div className="flex items-center gap-2 sm:gap-3 ms-4 sm:ms-10">
            <div className="flex justify-center">
              <img
                src="/rwtc_hdr.gif"
                alt="كلية مجتمع المرأة برام الله - الطيرة"
                title="كلية مجتمع المرأة برام الله - الطيرة"
                className="h-14 w-14 md:h-12 md:w-12"
              />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">
                كلية مجتمع المرأة برام الله - الطيرة
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {user ? getRoleLabel(user.roleName) : ""}
                {user?.departmentName ? " - " + user?.departmentName : ""}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center ms-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center cursor-pointer  "
              >
                <div className=" flex items-center gap-2">
                  {/* <Settings /> */}
                  <UserRoundCog className="h-6! w-6!" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem className="justify-center bg-gray-300">
                {user?.fullName
                  ? (() => {
                      const parts = user.fullName.trim().split(" ");
                      const firstWord = parts[0];
                      const lastWord =
                        parts.length > 1 ? parts[parts.length - 1] : "";
                      return lastWord ? `${firstWord} ${lastWord}` : firstWord;
                    })()
                  : ""}{" "}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setPasswordDialogOpen(true)}
                className="cursor-pointer justify-end"
              >
                تغيير كلمة المرور
              </DropdownMenuItem>

              {user?.roleName?.toLowerCase() === "admin" && (
                <>
                  <DropdownMenuItem
                    onClick={() => setAdminProfileOpen(true)}
                    className="cursor-pointer justify-end"
                  >
                    تعديل الملف الشخصي
                  </DropdownMenuItem>
                  <LessonsManagementDialog>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer justify-end"
                    >
                      جدول الحصص
                    </DropdownMenuItem>
                  </LessonsManagementDialog>
                  <DropdownMenuItem
                    onClick={() => setSettingsDialogOpen(true)}
                    className="cursor-pointer justify-end"
                  >
                    اعدادات النظام
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer justify-end"
              >
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChangePasswordDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          />
          <SystemSettingsDialog
            open={settingsDialogOpen}
            onOpenChange={setSettingsDialogOpen}
          />
          <UpdateAdminDialog
            open={adminProfileOpen}
            onOpenChange={setAdminProfileOpen}
          />
        </div>
      </div>
    </header>
  );
}
