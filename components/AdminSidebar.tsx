// components/AdminSidebar.tsx
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
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";

interface NavLink {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

interface AdminSidebarProps {
  userId: string;
}

const links: NavLink[] = [
  { href: "/admin/orders", label: "Commandes", Icon: ClipboardList },
  { href: "/admin/products", label: "Produits", Icon: Box },
  { href: "/admin/categories", label: "Catégories", Icon: Tag },
  { href: "/admin/gallery", label: "Galerie", Icon: ImageIcon },
  { href: "/admin/settings", label: "Paramètres", Icon: Settings },
];

export default function AdminSidebar({ userId }: AdminSidebarProps) {
  const pathname = usePathname();
  const settings = useQuery(api.settings.getSettings);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const terminateSession = useMutation(api.auth_admin.terminateSession);

  // Collapse sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        window.innerWidth < 768 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Expand briefly on mobile
  const handleSidebarClick = () => {
    if (window.innerWidth < 768) {
      setIsExpanded(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsExpanded(false), 3000);
    }
  };

  if (!settings) return null;

  return (
    <aside
      ref={sidebarRef}
      onClick={handleSidebarClick}
      className={clsx(
        "h-screen bg-gray-900 text-gray-100 flex flex-col shadow-lg sticky top-0 transition-all duration-300",
        "md:w-60",
        isExpanded ? "w-60" : "w-16"
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-5 py-4 text-2xl font-semibold tracking-wide border-b border-gray-800",
          !isExpanded && "md:px-5 px-2"
        )}
      >
        <span
          className={clsx(
            "md:block",
            !isExpanded && "hidden md:block",
            "truncate"
          )}
        >
          {settings.store_name}
        </span>
        <span
          className={clsx("md:hidden", isExpanded && "hidden", "text-center")}
        >
          {settings.store_name
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </span>
      </div>

      {/* Shop link */}
      <div className="border-y border-gray-800 p-4">
        <Link
          href="/"
          target="_blank"
          className={clsx(
            "flex items-center gap-3 transition-colors",
            isExpanded ? "px-4 py-2" : "justify-center px-2 py-2 md:justify-start md:px-4",
            "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
        >
          <Home className="w-5 h-5" />
          <span
            className={clsx("text-sm font-medium", "md:block", !isExpanded && "hidden")}
          >
            Voir la boutique
          </span>
        </Link>
      </div>

      {/* Navigation links */}
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
              <span
                className={clsx("text-sm font-medium", "md:block", !isExpanded && "hidden")}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={async () => {
            try {
              await terminateSession({ userId: userId as Id<"users"> });
              toast({ title: "Déconnexion", description: "Vous avez été déconnecté." });
              window.location.reload();
            } catch {
              toast({ title: "Erreur", description: "Erreur lors de la déconnexion.", variant: "destructive" });
            }
          }}
          className={clsx(
            "flex items-center gap-3 py-2 mx-2 rounded-md transition-colors",
            isExpanded
              ? "px-4"
              : "justify-center px-2 md:justify-start md:px-4",
            "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
        >
          <LogOut className="w-5 h-5" />
          <span
            className={clsx(
              "text-sm font-medium",
              "md:block",
              !isExpanded && "hidden"
            )}
          >
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
}