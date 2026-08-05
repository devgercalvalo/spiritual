import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Sendero Espiritual. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <Link href="/blog" className="hover:text-purple-700">Blog</Link>
          <Link href="/admin/login" className="hover:text-purple-700">Acceso admin</Link>
        </div>
      </div>
    </footer>
  );
}
