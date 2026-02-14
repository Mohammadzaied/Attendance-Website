"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type SidebarItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  isActive?: boolean;
};

type SidebarContextType = {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  sidebarItems: SidebarItem[];
  setSidebarItems: (items: SidebarItem[]) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  useEffect(() => {
    // Check if window is defined (client-side)
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // On desktop, default to closed; on mobile, always start closed
      if (!mobile && !isOpen) {
        setIsOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle,
        setIsOpen,
        isMobile,
        sidebarItems,
        setSidebarItems,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
