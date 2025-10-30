"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function MainNav() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2 pl-4">
            <span className="inline-block font-bold">SaasK</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-primary sm:text-sm"
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/dashboard/users"
                className={cn(
                  "flex items-center text-lg font-medium transition-colors hover:text-primary sm:text-sm"
                )}
              >
                <Users className="mr-2 h-4 w-4" />
                Utilisateurs
              </Link>
            )}
            <Link
              href="/dashboard/profile"
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-primary sm:text-sm"
              )}
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {/* Desktop Auth/User Info */}
          <nav className="hidden md:flex items-center space-x-1">
            {session?.user ? (
              <>
                <span className="text-sm font-medium">
                  {session.user.name || session.user.email}!
                </span>
                <Button variant="ghost" onClick={() => signOut()} className="ml-2">
                  Se déconnecter
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/sign-in">Se connecter</Link>
              </Button>
            )}
          </nav>
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-zinc-900/10">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="inline-block font-bold">SaasK</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-zinc-500/10">
                <div className="space-y-2 py-6">
                  <Link
                    href="/dashboard"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-zinc-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  {session?.user?.role === "ADMIN" && (
                    <Link
                      href="/dashboard/users"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-zinc-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Utilisateurs
                    </Link>
                  )}
                  <Link
                    href="/dashboard/profile"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-zinc-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                </div>
                <div className="py-6">
                  {session?.user ? (
                    <>
                      <span className="block px-3 py-2 text-base font-semibold leading-7 text-zinc-900">
                        {session.user.name || session.user.email}!
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-zinc-50"
                      >
                        Se déconnecter
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                        Se connecter
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
