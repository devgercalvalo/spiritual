import Link from "next/link";
import { FileText, MessageSquare, Package, ShoppingBag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: posts }, { count: pendingComments }, { count: products }, { count: kits }] =
    await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("kits").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Publicaciones", value: posts ?? 0, href: "/admin/posts", icon: FileText },
    { label: "Comentarios pendientes", value: pendingComments ?? 0, href: "/admin/comentarios", icon: MessageSquare },
    { label: "Productos", value: products ?? 0, href: "/admin/productos", icon: Package },
    { label: "Kits", value: kits ?? 0, href: "/admin/kits", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="transition hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">{label}</CardTitle>
                <Icon className="h-4 w-4 text-purple-700" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
