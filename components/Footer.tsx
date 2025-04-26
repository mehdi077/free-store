'use client'

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/main_logo.png";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const settings = useQuery(api.settings.getSettings);

  // If settings are still loading, don't render anything
  if (!settings) return null;

  // If show_header is false, don't render the footer
  if (!settings.show_header) return null;
  
  return (
    <footer className="w-full bg-[#102161] text-white mt-8">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About Section */}
          <div className="space-y-6">
            <Link href="/" className="block">
              {settings?.big_logo ? (
                <Image
                  src={settings.big_logo}
                  alt="Vibe Shop"
                  width={200}
                  height={50}
                  className="object-contain h-[50px] w-auto bg-white p-2 rounded-lg"
                  priority
                />
              ) : (
                <Image
                  src={logo}
                  alt="Vibe Shop"
                  className="object-contain h-[50px] w-auto bg-white p-2 rounded-lg"
                  priority
                />
              )}
            </Link>
            <p className="text-gray-200 leading-relaxed">
              Votre marketplace de confiance en Algérie pour acheter et vendre en toute sécurité. Nous nous engageons à fournir une expérience d'achat exceptionnelle.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contactez-nous</h3>
            <div className="space-y-4">
              {settings?.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-300" />
                  <a href={`tel:+213${settings.phone_number}`} className="text-gray-200 hover:text-white transition">
                    +213 {settings.phone_number}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-300" />
                <a href="mailto:contact@vibeshop.dz" className="text-gray-200 hover:text-white transition">
                  contact@vibeshop.dz
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-300" />
                <span className="text-gray-200">
                  Algérie
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/" className="text-gray-200 hover:text-white transition">
                Accueil
              </Link>
              <Link href="/products" className="text-gray-200 hover:text-white transition">
                Produits
              </Link>
              <Link href="/terms" className="text-gray-200 hover:text-white transition">
                Conditions d'utilisation
              </Link>
              <Link href="/privacy" className="text-gray-200 hover:text-white transition">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-blue-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300">
              © 2024 MarketDZ. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition">
                {"Conditions d'utilisation"}
              </Link>
              <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 