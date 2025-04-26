
import { redirect } from "next/navigation";

// function AdminPanel() {
//   return (
//     <div>AdminPanel</div>
//   )
// }

export default function AdminRootPage() {
  redirect("/admin/orders");
}