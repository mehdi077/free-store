"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import "../globals.css";
import { SignInWithPassword } from "@/components/SignInWithPassword";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const authData = useQuery(api.auth_admin.userAuth);
  if (authData === undefined) {
  // Still loading
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (authData === null) {
    // Not authenticated
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1 text-center bg-white py-2 rounded-xl">Admin</h1>
          <SignInWithPassword />
          {/* <p className="text-center text-gray-500">You must be signed in to access this page.</p> */}
        </div>
      </main>
    );
  }

  const { userId } = authData;
  console.log(authData);
  

  return (
    <>
    <div className="flex">
      <AdminSidebar userId={String(userId)} />
      <div className="flex-1 min-h-screen bg-gray-100 p-6 overflow-auto">
        {children}
      </div>
    </div>
    </>
  );
}