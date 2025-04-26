'use client'

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const TarifLivraisonInitializer = () => {
  // Get the query to check if data exists
  const dataExists = useQuery(api.tarif_livraison.checkTarifLivraisonExists);
  
  // Get the mutation to import data
  const importData = useMutation(api.tarif_livraison.importWilayaData);

  useEffect(() => {
    // Only run if we have a definitive answer about data existence
    if (dataExists === false) {
      // If no data exists, import it
      importData();
    }
  }, [dataExists, importData]);

  // This component doesn't render anything
  return null;
};

export default TarifLivraisonInitializer; 