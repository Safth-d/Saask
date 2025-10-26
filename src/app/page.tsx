import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center p-8">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          TaskFlow
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl">
          L'outil de collaboration ultime pour les équipes modernes. Créez, assignez et
          suivez les tâches de manière transparente au sein de toute votre organisation.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">Commencer</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Se connecter</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}