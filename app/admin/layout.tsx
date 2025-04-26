import AdminSidebar from "@/components/AdminSidebar";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-gray-100 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
