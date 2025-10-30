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
import Image from "next/image";
import { Plus, Folder, Calendar } from "lucide-react"; // Added for the button icon
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-4 w-full" />
            <div>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true); // New state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true); // Set loading to true before fetching
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    } else {
      toast.error("Échec de la récupération des projets.");
    }
    setIsLoadingProjects(false); // Set loading to false after fetching
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

  if (status === "loading" || isLoadingProjects) { // Modified condition
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-4 mt-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (session) {
    return (
      <div className="min-h-screen p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 mt-8 gap-4">
                <h2 className="text-2xl font-semibold">Vos Projets</h2>
                <div className="flex gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="mr-2 h-4 w-4" />Créer un nouveau projet</Button>
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
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                          />
                        </div>
                        <Button type="submit">Créer le projet</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {isLoadingProjects ? ( // Show skeleton if projects are still loading
                  <DashboardSkeleton />
                ) : projects.length === 0 ? ( // Only show "no projects" if not loading and empty
                  <div className="text-center col-span-3">
                    <Image
                      src="/file.svg"
                      alt="No projects"
                      width={128}
                      height={128}
                      className="mx-auto"
                    />
                    <p className="mt-4">Aucun projet trouvé. Créez-en un pour commencer !</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <motion.div key={project.id} variants={itemVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Folder className="mr-2 h-5 w-5" />
                            <Link href={`/projects/${project.id}`}>{project.name}</Link>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{project.description || "Pas de description"}</p>
                          {project.totalTasks > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                                <span>Tâches</span>
                                <span>{project.completedTasks} / {project.totalTasks}</span>
                              </div>
                              <Progress value={(project.completedTasks / project.totalTasks) * 100} />
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-4 flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Créé le : {
                              !isNaN(new Date(project.createdAt).getTime())
                                ? new Date(project.createdAt).toLocaleDateString()
                                : 'Date invalide'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
    );
  }

  return null;
}
