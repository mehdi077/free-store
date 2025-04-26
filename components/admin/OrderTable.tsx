"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export interface OrderWithExtras extends Order {
  delivery_address?: string;
  exact_address?: string;
  order_remarks?: string;
  selected_wilaya?: string;
}

export interface Order {
  _id: string;
  full_name: string;
  phone_number: number;
  quantity: number;
  product_name: string;
  product_id: string;
  total_price: number;
  created_at: string;
  _creationTime: number;
  // Optional fields from schema
  delivery_address?: string;
  exact_address?: string;
  order_remarks?: string;
  selected_wilaya?: string;
  product: string;
  selected_delivery_type?: string;
}

interface Props {
  orders: OrderWithExtras[];
}

export default function OrderTable({ orders }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Liste des commandes</h2>
      </div>
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="w-[200px]" />
            <TableHead>Quantité</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            {/* Optional columns */}

            <TableHead>Type livraison</TableHead>
            <TableHead>Wilaya</TableHead>
            <TableHead>Adresse exacte</TableHead>
            <TableHead>Remarques</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o, i) => (
            <TableRow key={o._id} className="hover:bg-gray-50">
              <TableCell>{i + 1}</TableCell>
              <TableCell>{o.full_name}</TableCell>
              <TableCell>0{o.phone_number}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={o.product_name}>
                {o.product_name}
              </TableCell>
              <TableCell>
                <Link
                  href={`/product/${o.product}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="sr-only">Voir produit</span>
                </Link>
              </TableCell>
              <TableCell>{o.quantity}</TableCell>
              <TableCell>{o.total_price.toLocaleString()} DZD</TableCell>
              <TableCell>
                {new Date(o._creationTime).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </TableCell>

              <TableCell>{o.selected_delivery_type ?? "-"}</TableCell>
              <TableCell>{o.selected_wilaya ?? "-"}</TableCell>
              <TableCell>{o.exact_address ?? "-"}</TableCell>
              <TableCell className="max-w-[150px] truncate" title={o.order_remarks ?? "-"}>
                {o.order_remarks ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
