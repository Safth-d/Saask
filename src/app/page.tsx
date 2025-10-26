"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutGrid, Folder, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: <LayoutGrid className="h-8 w-8 text-primary" />,
      title: "Tableau Kanban Intuitif",
      description: "Organisez vos tâches avec un système de glisser-déposer simple et visuel.",
    },
    {
      icon: <Folder className="h-8 w-8 text-primary" />,
      title: "Gestion de Projets",
      description: "Centralisez tous vos projets et suivez leur avancement en un coup d'œil.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaboration d'Équipe",
      description: "Invitez des membres et assignez des tâches pour une collaboration transparente.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Gestion des Rôles",
      description: "Contrôlez les permissions avec des rôles d'administrateur et de membre.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SaasK</h1>
        <Button asChild variant="ghost">
          <Link href="/sign-in">Se connecter</Link>
        </Button>
      </header>

      <main className="flex-grow">
        <motion.section
          className="container mx-auto px-4 pt-24 pb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            L'outil de collaboration ultime
          </h2>
          <p className="max-w-[700px] mx-auto mt-4 text-muted-foreground md:text-xl">
            Créez, assignez et suivez les tâches de manière transparente au sein de toute votre organisation.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Commencer Gratuitement</Link>
            </Button>
          </div>
        </motion.section>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h3 className="text-3xl font-bold">Tout ce dont vous avez besoin</h3>
            <p className="max-w-[600px] mx-auto mt-2 text-muted-foreground">
              Une suite complète d'outils pour transformer votre productivité.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="p-6 bg-card rounded-lg border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SaasK. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
