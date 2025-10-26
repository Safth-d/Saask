"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    } else {
      toast.error("Échec de la récupération des projets.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newProjectName,
        description: newProjectDescription,
      }),
    });

    if (res.ok) {
      toast.success("Projet créé avec succès !");
      setNewProjectName("");
      setNewProjectDescription("");
      setIsDialogOpen(false);
      fetchProjects(); // Refresh projects list
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Échec de la création du projet.");
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div className="min-h-screen p-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">
                  Bienvenue sur votre tableau de bord, {session.user?.name || session.user?.email}!
                </h1>
                <Button onClick={() => signOut()} variant="destructive">
                  Se déconnecter
                </Button>
              </div>
        
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Vos Projets</h2>
                <div className="flex gap-2">
                  {session.user?.role === "ADMIN" && (
                    <Button asChild>
                      <Link href="/dashboard/users">Gérer les utilisateurs</Link>
                    </Button>
                  )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Créer un nouveau projet</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un nouveau projet</DialogTitle>
                        <DialogDescription>
                          Entrez les détails de votre nouveau projet.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateProject} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="projectName">Nom du projet</Label>
                          <Input
                            id="projectName"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="projectDescription">Description</Label>
                          <Input
                            id="projectDescription"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectName(e.target.value)}
                          />
                        </div>
                        <Button type="submit">Créer le projet</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
        
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length === 0 ? (
                  <p>Aucun projet trouvé. Créez-en un pour commencer !</p>
                ) : (
                  projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle>
                          <Link href={`/projects/${project.id}`}>{project.name}</Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{project.description || "Pas de description"}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Créé le : {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>      </div>
    );
  }

  return null;
}
