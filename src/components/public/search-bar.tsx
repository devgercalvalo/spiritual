import { Search } from "lucide-react";

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/buscar" method="GET" className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Buscar oraciones, rituales, reflexiones…"
        className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 dark:border-neutral-700 dark:bg-neutral-900"
      />
    </form>
  );
}
