"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, tenantName, subdomain }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Registration failed");
    } else {
      // Registration successful, redirect to sign-in or dashboard
      router.push(`/sign-in?subdomain=${subdomain}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                  <h1 className="text-3xl font-bold">S'inscrire</h1>
                  <p className="text-balance text-muted-foreground">
                    Créez votre compte et votre organisation
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tenantName">Nom de l'organisation</Label>
                    <Input
                      id="tenantName"
                      type="text"
                      placeholder="Mon Entreprise"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subdomain">Sous-domaine</Label>
                    <Input
                      id="subdomain"
                      type="text"
                      placeholder="monentreprise"
                      required
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full">
                    S'inscrire
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  Vous avez déjà un compte ?{" "}
                  <Link href="/sign-in" className="underline">
                    Se connecter
                  </Link>
                </div>
      </div>
    </div>
  );
}