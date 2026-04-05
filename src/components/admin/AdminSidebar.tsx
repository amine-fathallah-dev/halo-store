"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: `/${locale}/admin`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/${locale}/admin/produits`, label: "Produits", icon: Package },
    { href: `/${locale}/admin/commandes`, label: "Commandes", icon: ShoppingCart },
    { href: `/${locale}/admin/blog`, label: "Blog", icon: FileText },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/admin/login`);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-dm text-sm transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-bronze text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-noir text-white z-40 flex-col hidden md:flex">
        <div className="px-6 py-8 border-b border-white/10">
          <p className="font-cormorant text-2xl tracking-[0.3em]">HALO</p>
          <p className="font-dm text-xs text-white/40 tracking-widest uppercase mt-1">Admin</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLinks />
        </nav>
        <div className="px-4 pb-6 border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl font-dm text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 w-full cursor-pointer"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-noir text-white flex items-center justify-between px-4 h-14">
        <p className="font-cormorant text-xl tracking-[0.3em]">HALO</p>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-white/60 hover:text-white cursor-pointer"
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-noir/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-noir text-white flex flex-col md:hidden">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="font-cormorant text-2xl tracking-[0.3em]">HALO</p>
                <p className="font-dm text-xs text-white/40 tracking-widest uppercase mt-0.5">Admin</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/60 hover:text-white cursor-pointer"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
            <div className="px-4 pb-8 border-t border-white/10 pt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-dm text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 w-full cursor-pointer"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
