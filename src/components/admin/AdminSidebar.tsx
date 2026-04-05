"use client";

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
} from "lucide-react";

export default function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-noir text-white z-40 flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/10">
        <p className="font-cormorant text-2xl tracking-[0.3em]">HALO</p>
        <p className="font-dm text-xs text-white/40 tracking-widest uppercase mt-1">
          Admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
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
      </nav>

      {/* Logout */}
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
  );
}
