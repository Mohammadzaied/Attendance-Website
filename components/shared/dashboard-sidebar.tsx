"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SidebarItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  isActive?: boolean;
};

type DashboardSidebarProps = {
  items: SidebarItem[];
};

export function DashboardSidebar({ items: propsItems }: DashboardSidebarProps) {
  const pathname = usePathname();
  const {
    isOpen,
    setIsOpen,
    isMobile,
    sidebarItems: contextItems,
  } = useSidebar();

  const items = propsItems && propsItems.length > 0 ? propsItems : contextItems;

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    }
    // Close sidebar on mobile after clicking
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <nav className="space-y-2">
      {items.map((item, index) => {
        const isActive = item.isActive ?? (item.href && pathname === item.href);

        const content = (
          <>
            <div key={index} className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "shrink-0",
                  isActive ? "text-blue-600" : "text-gray-600",
                )}
              >
                {item.icon}
              </div>
              {(isOpen || isMobile) && (
                <span
                  className={cn(
                    "font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis",
                    isActive ? "text-blue-600" : "text-gray-700",
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
            {(isOpen || isMobile) &&
              item.badge !== undefined &&
              item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shrink-0">
                  {item.badge}
                </span>
              )}
            {!isOpen &&
              !isMobile &&
              item.badge !== undefined &&
              item.badge > 0 && (
                <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full" />
              )}
          </>
        );

        const baseClasses = cn(
          "w-full flex items-center p-3 rounded-lg transition-colors relative cursor-pointer",
          isActive
            ? "bg-blue-50 border border-blue-200"
            : "hover:bg-gray-50 border border-transparent",
          !isOpen && !isMobile && "justify-center",
        );

        if (item.onClick) {
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className={baseClasses}
              title={!isOpen && !isMobile ? item.label : undefined}
            >
              {content}
            </button>
          );
        }

        if (item.href) {
          return (
            <Link
              key={index}
              href={item.href}
              className={baseClasses}
              title={item.label}
              onClick={() => handleItemClick(item)}
            >
              {content}
            </Link>
          );
        }

        return null;
      })}
    </nav>
  );

  // Mobile: Render as Sheet (drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-64 p-4">
          <SheetHeader>
            <SheetTitle className="text-right m-1">القائمة</SheetTitle>
          </SheetHeader>
          <div className="mt-8">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as fixed sidebar
  return (
    <aside
      className={cn(
        "hidden lg:block absolute top-0 right-0 bottom-0  mt-[81px] min-h-screen bg-white border-l shadow-lg z-40 transition-all duration-300",
        isOpen ? "w-64" : "w-20",
        "p-4",
      )}
    >
      <SidebarContent />
    </aside>
  );
}
