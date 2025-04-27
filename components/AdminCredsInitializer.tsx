// components/AdminCredsInitializer.tsx
"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminCredsInitializer() {
  const credsExist = useQuery(api.admin_creds.adminCredsExist);
  const ensureCreds = useMutation(
    api.admin_creds.ensureDefaultAdminCreds
  );

  useEffect(() => {
    // Once we know no creds exist, insert the default pair
    if (credsExist === false) {
      ensureCreds();
    }
  }, [credsExist, ensureCreds]);

  return null;
}