"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChartBar, IconSearch } from "@tabler/icons-react";
import { CiviliumLogo } from "@/components/ui/civilium-logo";
import { StatusExtensao } from "@/components/dominio/status-extensao";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/painel", label: "Painel", icon: IconChartBar },
  { href: "/lote", label: "Nova pesquisa", icon: IconSearch },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <header className="glass-bar fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[var(--app-header-height)] max-w-6xl items-center justify-between gap-4 px-4">
          <CiviliumLogo height={34} />

          <div className="flex items-center gap-3">
            <StatusExtensao />
            <nav className="flex gap-1.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const ativo =
                  href === "/painel"
                    ? pathname === "/painel"
                    : pathname.startsWith("/lote");

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      ativo
                        ? "bg-civilium-primary text-white shadow-sm"
                        : "text-slate-700 hover:bg-white/55",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
        <main className="flex-1 px-4 pb-24 pt-[calc(var(--app-header-height)+1.5rem)]">
          {children}
        </main>
      </div>
    </>
  );
}
