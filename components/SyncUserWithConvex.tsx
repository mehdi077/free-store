"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Zap, Image, FileSpreadsheet, Gift, Check, X } from "lucide-react";

export default function SyncUserWithConvex() {
  const { user } = useUser();
  const updateUser = useMutation(api.users.updateUser);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      try {
        const result = await updateUser({
          userId: user.id,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          email: user.emailAddresses[0]?.emailAddress ?? "",
        });

        // Check if the user is new based on the returned object
        if (result && typeof result === "object" && result.new === true) {
          setIsNewUser(true);
          setShowWelcomeModal(true);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [user, updateUser]);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
  };

  return (
    <>
      {/* Welcome Modal - Only shown for new users */}
      {isNewUser && showWelcomeModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-xl overflow-hidden shadow-xl max-w-sm w-full mx-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white p-4 relative">
              <button 
                onClick={handleCloseModal} 
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-light tracking-tight">
                {"Bienvenue sur ScanSheet !"}
              </h2>
              <p className="text-sm text-neutral-300 mt-1">
                {"Nous sommes ravis de vous avoir parmi nous."}
              </p>
            </div>
            
            {/* Modal Content */}
            <div className="p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-neutral-900" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-center text-neutral-900 mb-2">
                {"10 crédits gratuits pour commencer"}
              </h3>
              
              <p className="text-sm text-center text-neutral-600 mb-4">
                {"Nous vous offrons 10 crédits pour essayer notre service d'extraction de données d'images et de PDF vers Excel."}
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center p-2 bg-neutral-50 rounded-lg">
                  <Image className="w-5 h-5 text-neutral-800 mb-1" />
                  <span className="text-xs text-neutral-700 text-center">
                    {"Importez vos images"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-neutral-50 rounded-lg">
                  <Zap className="w-5 h-5 text-neutral-800 mb-1" />
                  <span className="text-xs text-neutral-700 text-center">
                    {"Extraction automatique"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-neutral-50 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-neutral-800 mb-1" />
                  <span className="text-xs text-neutral-700 text-center">
                    {"Téléchargez en Excel"}
                  </span>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-lg mb-4">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-neutral-900 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-700">
                    {"Chaque image traitée consomme 1 crédit. Vous pouvez acheter davantage de crédits à tout moment depuis votre tableau de bord."}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleCloseModal}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm text-center rounded-lg transition-colors"
              >
                {"Commencer maintenant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}