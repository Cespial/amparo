"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Map, User, Building2, Scale, Menu, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCasoStore } from "@/lib/store";
import type { RolUsuario } from "@/lib/types";

interface NavLink {
  href: string;
  label: string;
  rol: RolUsuario;
  icon: React.ComponentType<{ className?: string }>;
}

const LINKS: NavLink[] = [
  { href: "/atlas", label: "Atlas", rol: "atlas", icon: Map },
  { href: "/demandante", label: "Demandante", rol: "demandante", icon: User },
  { href: "/demandado", label: "Demandado", rol: "demandado", icon: Building2 },
  { href: "/juez", label: "Juez", rol: "juez", icon: Scale },
];

const ROL_HREF: Record<RolUsuario, string> = {
  atlas: "/atlas",
  demandante: "/demandante",
  demandado: "/demandado",
  juez: "/juez",
};

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-11",
              active
                ? "bg-white/15 text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

function RolSelector() {
  const rolActivo = useCasoStore((s) => s.rolActivo);
  const setRolActivo = useCasoStore((s) => s.setRolActivo);

  return (
    <Select
      value={rolActivo}
      onValueChange={(v) => setRolActivo(v as RolUsuario)}
    >
      <SelectTrigger
        size="sm"
        aria-label="Seleccionar rol"
        className="w-[150px] border-white/20 bg-white/10 text-white"
      >
        <SelectValue placeholder="Rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="atlas">Atlas</SelectItem>
        <SelectItem value="demandante">Demandante</SelectItem>
        <SelectItem value="demandado">Demandado (EPS)</SelectItem>
        <SelectItem value="juez">Juez</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-navy text-navy-foreground shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg">
            <Shield className="size-5 text-white" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-white">
              Amparo
            </span>
            <span className="hidden text-[11px] text-white/60 sm:block">
              Centro de Resolución de Disputas en Salud
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="mx-2 hidden items-center gap-1 md:flex">
          <NavItems />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <RolSelector />
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 md:hidden"
                  aria-label="Abrir menú"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-navy text-navy-foreground">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-white">
                  <Shield className="size-5 text-primary" /> Amparo
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <NavItems onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-4 px-4">
                <RolSelector />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { ROL_HREF };
