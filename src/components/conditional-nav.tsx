"use client";

import { usePathname } from "next/navigation";
import { MainNav } from "./main-nav";

export function ConditionalNav() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }

  return <MainNav />;
}
