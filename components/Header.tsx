// components/Header.tsx
'use client'

import Image from "next/image";
import { Menu, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import Link from "next/link";
import logo from "@/public/images/main_logo.png";
import { useState } from "react";
import SidePanel from "@/components/SidePanel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import TarifLivraisonInitializer from "@/components/TarifLivraisonInitializer";

function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const settings = useQuery(api.settings.getSettings);

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  if (!settings) return null;
  if (!settings.show_header) return null;

  return (
    <header className="w-full border-b py-2 bg-white shadow-lg sticky top-0 z-10">



      {/* Existing tarif initializer */}
      <TarifLivraisonInitializer />

      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full px-2 relative ">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={togglePanel}
          >
            <Menu className="h-[30px] w-auto text-[#102161]" />
          </Button>
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 md:static md:left-0 md:transform-none"
          >
            {settings.big_logo ? (
              <Image
                src={settings.big_logo}
                alt="free store"
                width={160}
                height={40}
                className="object-contain h-[40px] w-auto"
                priority
              />
            ) : (
              <Image
                src={logo}
                alt="free store"
                className="object-contain h-[40px] w-auto"
                priority
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#102161]"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? (
              <X className="h-6 w-6" />
            ) : (
              <Search className="h-6 w-6" />
            )}
          </Button>
        </div>
        <div
          className={`w-full md:block ${
            showMobileSearch ? "block" : "hidden"
          }`}
        >
          <SearchBar />
        </div>
      </div>
      <SidePanel isOpen={isPanelOpen} onClose={togglePanel} />
    </header>
  );
}

export default Header;