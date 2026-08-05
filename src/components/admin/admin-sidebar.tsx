"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShoppingBag,
  Tags,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Publicaciones", icon: FileText },
  { href: "/admin/comentarios", label: "Comentarios", icon: MessageSquare },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/kits", label: "Kits", icon: ShoppingBag },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 px-2">
        <span className="font-display text-lg font-semibold text-purple-800 dark:text-purple-300">
          Sendero Espiritual
        </span>
        <p className="text-xs text-neutral-400">Panel administrativo</p>
      </div>
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-purple-700 text-white"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </aside>
  );
}
