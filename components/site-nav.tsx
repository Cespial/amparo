"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Map,
  User,
  Building2,
  Scale,
  Menu,
  Shield,
  Mic,
  Presentation,
} from "lucide-react";
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
import { useT } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

interface NavLink {
  href: string;
  labelKey: string;
  rol: RolUsuario;
  icon: React.ComponentType<{ className?: string }>;
}

const LINKS: NavLink[] = [
  { href: "/atlas", labelKey: "link.atlas", rol: "atlas", icon: Map },
  { href: "/demandante", labelKey: "link.demandante", rol: "demandante", icon: User },
  { href: "/demandado", labelKey: "link.demandado", rol: "demandado", icon: Building2 },
  { href: "/juez", labelKey: "link.juez", rol: "juez", icon: Scale },
];

const ROL_HREF: Record<RolUsuario, string> = {
  atlas: "/atlas",
  demandante: "/demandante",
  demandado: "/demandado",
  juez: "/juez",
};

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT("nav");
  return (
    <>
      {LINKS.map(({ href, labelKey, icon: Icon }) => {
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
            {t(labelKey)}
          </Link>
        );
      })}
    </>
  );
}

function RolSelector() {
  const rolActivo = useCasoStore((s) => s.rolActivo);
  const setRolActivo = useCasoStore((s) => s.setRolActivo);
  const t = useT("nav");

  return (
    <Select
      value={rolActivo}
      onValueChange={(v) => setRolActivo(v as RolUsuario)}
    >
      <SelectTrigger
        size="sm"
        aria-label={t("rol.aria")}
        className="w-[150px] border-white/20 bg-white/10 text-white"
      >
        <SelectValue placeholder={t("rol.placeholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="atlas">{t("rol.atlas")}</SelectItem>
        <SelectItem value="demandante">{t("rol.demandante")}</SelectItem>
        <SelectItem value="demandado">{t("rol.demandado")}</SelectItem>
        <SelectItem value="juez">{t("rol.juez")}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const t = useT("nav");

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
              {t("brand.name")}
            </span>
            <span className="hidden text-[11px] text-white/60 sm:block">
              {t("brand.tagline")}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="mx-2 hidden items-center gap-1 md:flex">
          <Link
            href="/asistente"
            className="mr-1 flex items-center gap-2 rounded-lg bg-primary/90 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors min-h-11 hover:bg-primary"
          >
            <Mic className="size-4" />
            {t("cta.talk")}
          </Link>
          <NavItems />
          {/* Enlace discreto al deck de pitch */}
          <Link
            href="/pitch"
            className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/55 transition-colors min-h-11 hover:bg-white/10 hover:text-white/90"
          >
            <Presentation className="size-4" />
            {t("link.pitch")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
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
                  aria-label={t("menu.open")}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-navy text-navy-foreground">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-white">
                  <Shield className="size-5 text-primary" /> {t("brand.name")}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <Link
                  href="/asistente"
                  onClick={() => setOpen(false)}
                  className="mb-1 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white min-h-11"
                >
                  <Mic className="size-4" />
                  {t("cta.talk")}
                </Link>
                <NavItems onNavigate={() => setOpen(false)} />
                {/* Enlace discreto al deck de pitch */}
                <Link
                  href="/pitch"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/55 transition-colors min-h-11 hover:bg-white/10 hover:text-white/90"
                >
                  <Presentation className="size-4" />
                  {t("link.pitch")}
                </Link>
              </nav>
              <div className="mt-4 flex items-center justify-between gap-2 px-4">
                <RolSelector />
                <LanguageToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { ROL_HREF };
