"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function MainNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2 pl-4">
            <span className="inline-block font-bold">SaasK</span>
          </Link>
          <nav className="flex gap-6">
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
          <nav className="flex items-center space-x-1">
            {session?.user ? (
              <>
                <span className="text-sm font-medium">
                  Bienvenue, {session.user.name || session.user.email}!
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
        </div>
      </div>
    </header>
  );
}
