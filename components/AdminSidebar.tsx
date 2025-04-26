"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Box,
  Tag,
  Image as ImageIcon,
  Settings,
  Home,
} from "lucide-react";
import clsx from "clsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";

interface NavLink {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const links: NavLink[] = [
  { href: "/admin/orders", label: "Commandes", Icon: ClipboardList },
  { href: "/admin/products", label: "Produits", Icon: Box },
  { href: "/admin/categories", label: "Catégories", Icon: Tag },
  { href: "/admin/gallery", label: "Galerie", Icon: ImageIcon },
  { href: "/admin/settings", label: "Paramètres", Icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const settings = useQuery(api.settings.getSettings);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle clicks outside the sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle sidebar expansion
  const handleSidebarClick = () => {
    if (window.innerWidth < 768) {
      setIsExpanded(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to collapse after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
    }
  };

  return (
    <aside 
      ref={sidebarRef}
      onClick={handleSidebarClick}
      className={clsx(
        "h-screen bg-gray-900 text-gray-100 flex flex-col shadow-lg sticky top-0 transition-all duration-300",
        "md:w-60", // Always expanded on desktop
        isExpanded ? "w-60" : "w-16" // Mobile behavior
      )}
    >
      <div className={clsx(
        "px-5 py-4 text-2xl font-semibold tracking-wide border-b border-gray-800",
        !isExpanded && "md:px-5 px-2"
      )}>
        <span className={clsx(
          "md:block", // Always show on desktop
          !isExpanded && "hidden md:block", // Hide on mobile when collapsed, but show on desktop
          "truncate" // Prevent long names from breaking layout
        )}>
          {settings?.store_name}
        </span>
        <span className={clsx(
          "md:hidden", // Never show on desktop
          isExpanded && "hidden", // Hide when expanded on mobile
          "text-center block" // Center the initials
        )}>
          {settings?.store_name?.split(' ').map(word => word[0]).join('').slice(0, 2)}
        </span>
      </div>
      <div className="border-y border-gray-800 p-4">
        <Link
          href="/"
          target="_blank"
          className={clsx(
            "flex items-center gap-3 rounded-md transition-colors text-gray-300 hover:bg-gray-800 hover:text-white",
            isExpanded ? "px-4 py-2" : "justify-center px-2 py-2 md:justify-start md:px-4"
          )}
        >
          <Home className="w-5 h-5" />
          <span className={clsx(
            "text-sm font-medium",
            "md:block", // Always show on desktop
            !isExpanded && "hidden" // Hide on mobile when collapsed
          )}>
            Voir la boutique
          </span>
        </Link>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 py-2 mx-2 rounded-md transition-colors",
                isExpanded ? "px-4" : "justify-center px-2 md:justify-start md:px-4",
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={clsx(
                "text-sm font-medium",
                "md:block", // Always show on desktop
                !isExpanded && "hidden" // Hide on mobile when collapsed
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
