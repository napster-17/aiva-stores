// src/components/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [showNav, setShowNav] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (pathname === "/auth" || pathname === "/verify-otp") return null;

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-3">
        <button onClick={() => setShowNav(!showNav)}>
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="text-lg font-semibold">
          Kirana Admin
        </Link>
      </div>

      {session && (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            location.href = "/auth";
          }}
        >
          Logout
        </Button>
      )}

      {showNav && (
        <div className="fixed inset-y-0 left-0 bg-white z-50 p-6 w-64 shadow-lg border-r animate-slide-in-left">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold">Navigation</h2>
            <button onClick={() => setShowNav(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/global-products"
                  onClick={() => setShowNav(false)}
                  className={
                    pathname === "/global-products"
                      ? "font-semibold text-blue-600"
                      : "hover:text-blue-600"
                  }
                >
                  Global Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/ledger"
                  onClick={() => setShowNav(false)}
                  className={
                    pathname === "/ledger"
                      ? "font-semibold text-blue-600"
                      : "hover:text-blue-600"
                  }
                >
                  Ledger
                </Link>
              </li>
              <li>
                <Link
                  href="/disputes"
                  onClick={() => setShowNav(false)}
                  className={
                    pathname === "/disputes"
                      ? "font-semibold text-blue-600"
                      : "hover:text-blue-600"
                  }
                >
                  Disputes
                </Link>
              </li>
              <li>
                <Link
                  href="/store"
                  onClick={() => setShowNav(false)}
                  className={
                    pathname === "/store"
                      ? "font-semibold text-blue-600"
                      : "hover:text-blue-600"
                  }
                >
                  All Stores
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Analytics (coming soon)</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
