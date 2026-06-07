import Link from "next/link";
import { IconChartBar, IconSearch } from "@tabler/icons-react";
import { StatusExtensao } from "@/components/dominio/status-extensao";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/painel" className="text-xl font-bold text-blue-800">
            Civilium
          </Link>
          <div className="flex items-center gap-3">
            <StatusExtensao />
            <nav className="flex gap-2">
              <Link
                href="/painel"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <IconChartBar className="h-4 w-4" />
                Painel
              </Link>
              <Link
                href="/lote"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <IconSearch className="h-4 w-4" />
                Nova pesquisa
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
