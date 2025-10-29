"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, GripVertical, Calendar as CalendarIcon, ChevronUp, Equal, ChevronDown, ListTodo, Signal, User, Filter, ArrowUpDown, ArrowUp, ArrowDown, Folder, ArrowLeft, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomPortal } from "@/components/custom-portal";

// Dnd-kit imports
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  assignee: User | null;
  createdAt: string;
  dueDate: string | null;
}

// Component for the circular countdown timer
const CircularTimer = ({ createdAt, dueDate }: { createdAt: string; dueDate: string | null }) => {
  const startDate = useMemo(() => new Date(createdAt), [createdAt]);
  const endDate = useMemo(() => (dueDate ? new Date(dueDate) : null), [dueDate]);

  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("stroke-green-500");

  useEffect(() => {
    if (!endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      // Don't run the effect if dates are invalid or not present
      return;
    }

    const calculateProgress = () => {
      const now = new Date().getTime();
      const start = startDate.getTime();
      const end = endDate.getTime();

      if (now >= end) {
        return { percentage: 0, newColor: 'stroke-red-500' };
      }
      if (start >= end) {
        return { percentage: 0, newColor: 'stroke-red-500' };
      }

      const totalDuration = end - start;
      const remainingTime = end - now;
      const percentage = Math.max(0, (remainingTime / totalDuration) * 100);

      let newColor = "stroke-green-500 dark:stroke-green-400";
      if (percentage <= 10) {
        newColor = "stroke-red-500 dark:stroke-red-400";
      } else if (percentage <= 25) {
        newColor = "stroke-yellow-500 dark:stroke-yellow-400";
      }
      
      return { percentage, newColor };
    };

    const updateState = () => {
      const { percentage, newColor } = calculateProgress();
      setProgress(percentage);
      setColor(newColor);
    };

    updateState();
    const interval = setInterval(updateState, 60000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!dueDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return null;
  }

  const SIZE = 24;
  const STROKE_WIDTH = 3;
  const radius = (SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 transform">
      {/* Background circle */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        strokeWidth={STROKE_WIDTH}
        className="stroke-muted/20"
        fill="transparent"
      />
      {/* Progress circle */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={radius}
        strokeWidth={STROKE_WIDTH}
        className={cn("transition-all duration-300", color)}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string; // Assuming Role enum is string-based
}

// Component for a single draggable task item
function SortableTask({ task, tenantUsers, onEdit, onDelete, onMarkAsDone, onAssign }: {
  task: Task;
  tenantUsers: User[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMarkAsDone: (taskId: string) => void;
  onAssign: (taskId: string, assigneeId: string | null) => void;
}) {
  console.log("Rendering SortableTask:", task.id, task.title);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case "todo": return "À faire";
      case "inprogress": return "En cours";
      case "done": return "Terminé";
      default: return status;
    }
  };

  const getTranslatedPriority = (priority: string) => {
    switch (priority) {
      case "LOW": return "Basse";
      case "MEDIUM": return "Moyenne";
      case "HIGH": return "Haute";
      default: return priority;
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'border-transparent bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
      <div className="flex items-start p-4">
        {/* Left Column: Handle and Timer */}
        <div className="flex flex-col items-center pr-4 gap-2 pt-1">
          <div ref={setActivatorNodeRef} {...listeners} {...attributes} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground/50" />
          </div>
          {task.status !== 'done' && <CircularTimer createdAt={task.createdAt} dueDate={task.dueDate} />}
        </div>

        {/* Right Column: Task Details */}
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <CardTitle className={`text-sm font-medium leading-snug ${task.status === 'done' ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="-mt-2 -mr-2 h-8 w-8 p-0"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { console.log("Edit task clicked:", task.id); onEdit(task); }}>Modifier</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Assigner à...</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => { console.log("Assign task to null clicked:", task.id); onAssign(task.id, null); }}>Non assigné</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {tenantUsers.map(user => (
                        <DropdownMenuItem key={user.id} onSelect={() => { console.log("Assign task to user clicked:", task.id, user.id); onAssign(task.id, user.id); }}>
                          {user.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { console.log("Delete task clicked:", task.id); onDelete(task.id); }} className="text-red-600">
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground mt-1">{task.description || "Pas de description"}</p>
          
          <div className="flex items-center justify-between text-xs mt-3">
            <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className={cn("flex items-center gap-1", getPriorityClasses(task.priority))}>
                {task.priority === 'HIGH' && <ChevronUp className="h-3 w-3" />}
                {task.priority === 'MEDIUM' && <Equal className="h-3 w-3" />}
                {task.priority === 'LOW' && <ChevronDown className="h-3 w-3" />}
                {getTranslatedPriority(task.priority)}
              </Badge>
              {task.assignee && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {task.assignee.name}
                </Badge>
              )}
                          {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1",
                                new Date(task.dueDate) < new Date() && task.status !== 'done' && "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800"
                              )}
                            >
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(task.dueDate), "d MMM, HH:mm", { locale: fr })}
                            </Badge>
                          )}            </div>
            {/* {task.status === 'inprogress' && (
              <Checkbox
                onCheckedChange={() => onMarkAsDone(task.id)}
                aria-label="Marquer comme terminée"
              />
            )} */}
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
}

// Component for a droppable column
function DroppableColumn({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  console.log("Rendering DroppableColumn:", id, title);
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[280px] max-w-[350px] bg-muted/40 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="min-h-[100px]"> {/* Ensure droppable area has height */}
        {children}
      </div>
    </div>
  );
}

export function ProjectPageSkeleton() {
  return (
    <div className="min-h-screen p-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-6 w-2/3 mb-8" />

      {/* Controls skeleton */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Kanban skeleton */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 min-w-[280px] max-w-[350px] bg-muted/40 p-4 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("todo");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | null>(null);
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const handleNewTaskDateTimeChange = ({ day, time }: { day?: Date; time?: string }) => {
    const currentDate = newTaskDueDate || new Date();
    let newDate = new Date(currentDate);

    if (day) {
      newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    }

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        newDate.setHours(hours, minutes, 0, 0); // Also reset seconds and ms
      }
    }

    setNewTaskDueDate(newDate);
  };

  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeId, setActiveId] = useState<string | null>(null);

  

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case "todo":
        return "À faire";
      case "inprogress":
        return "En cours";
      case "done":
        return "Terminé";
      default:
        return status;
    }
  };

  const getTranslatedPriority = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Basse";
      case "MEDIUM":
        return "Moyenne";
      case "HIGH":
        return "Haute";
      default:
        return priority;
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
    if (status === "authenticated" && projectId) {
      fetchProject();
      fetchTasks();
      fetchTenantUsers();
    }
  }, [status, router, projectId, filterStatus, filterPriority, sortBy, sortOrder]);

  const fetchTenantUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setTenantUsers(data);
    } else {
      toast.error("Échec de la récupération des utilisateurs du tenant.");
    }
  };

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    } else {
      toast.error("Échec de la récupération du projet.");
      router.push("/dashboard"); // Redirect if project not found or unauthorized
    }
  };

  const fetchTasks = async () => {
    const queryParams = new URLSearchParams();
    queryParams.append("projectId", projectId);
    if (filterStatus !== "ALL") {
      queryParams.append("status", filterStatus);
    }
    if (filterPriority !== "ALL") {
      queryParams.append("priority", filterPriority);
    }
    queryParams.append("sortBy", sortBy);
    queryParams.append("sortOrder", sortOrder);

    const res = await fetch(`/api/tasks?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else {
      toast.error("Échec de la récupération des tâches.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTaskTitle,
        description: newTaskDescription,
        projectId,
        status: newTaskStatus,
        priority: newTaskPriority,
        assigneeId: newTaskAssigneeId,
        dueDate: newTaskDueDate,
      }),
    });

    if (res.ok) {
      toast.success("Tâche créée avec succès !");
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      setNewTaskPriority("MEDIUM");
      setNewTaskAssigneeId(null);
      setNewTaskDueDate(undefined);
      setIsCreateTaskDialogOpen(false);
      fetchTasks(); // Refresh tasks list
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Échec de la création de la tâche.");
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const res = await fetch(`/api/tasks/${editingTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        assigneeId: editingTask.assigneeId,
        dueDate: editingTask.dueDate,
      }),
    });

    if (res.ok) {
      toast.success("Tâche mise à jour avec succès !");
      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
      fetchTasks(); // Refresh tasks list
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Échec de la mise à jour de la tâche.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Tâche supprimée avec succès !");
      fetchTasks(); // Refresh tasks list
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Échec de la suppression de la tâche.");
    }
  };

  const handleMarkAsDone = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: 'done' }),
    });

    if (res.ok) {
      toast.success("Tâche marquée comme terminée !");
      fetchTasks(); // Refresh tasks list
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Échec de la mise à jour de la tâche.");
    }
  };

  const handleAssignTask = async (taskId: string, assigneeId: string | null) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assigneeId }),
      });

      if (res.ok) {
        toast.success("Tâche assignée avec succès !");
        fetchTasks(); // Refresh tasks list
      } else {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.message || "Échec de l'assignation de la tâche.");
        } catch (e) {
          toast.error(`Erreur API: ${res.status} ${res.statusText}`);
        }
      }
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskDialogOpen(true);
  };
  const onDragEnd = async (event: DragEndEvent) => {
    console.log("Drag ended:", event.active.id, event.over?.id);
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id.toString();
    const activeContainer = active.data.current?.status;

    const overId = over.id.toString();
    const overData = over.data.current;
    let overContainer;

    if (overData?.type === 'task') {
      overContainer = overData.status;
    } else if (['todo', 'inprogress', 'done'].includes(overId)) {
      overContainer = overId;
    } else {
      // This can happen if dropping on the padding of the page, etc.
      return;
    }

    if (!activeContainer || !overContainer) {
      console.error("Could not determine drag containers");
      return;
    }

    // Handle reordering within the same column
    if (activeContainer === overContainer) {
      if (activeId !== overId) {
        setTasks((currentTasks) => {
          const oldIndex = currentTasks.findIndex((t) => t.id === activeId);
          const newIndex = currentTasks.findIndex((t) => t.id === overId);
          if (oldIndex > -1 && newIndex > -1) {
            return arrayMove(currentTasks, oldIndex, newIndex);
          }
          return currentTasks;
        });
      }
      return;
    }

    // Handle moving between different columns (changing status)
    const newStatus = overContainer;

    // Optimistically update the UI for a smooth animation
    setTasks((currentTasks) => {
      return currentTasks.map((task) => {
        if (task.id === activeId) {
          return { ...task, status: newStatus };
        }
        return task;
      });
    });

    const res = await fetch(`/api/tasks/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      toast.error("Échec de la mise à jour du statut. Annulation.");
      fetchTasks(); // Revert the optimistic update on failure
    } else {
      toast.success("Statut de la tâche mis à jour !");
      // Optional: Re-fetch to ensure data consistency, though not always necessary
      // fetchTasks();
    }
  };



  const onDragStart = (event: any) => {
    console.log("Drag started:", event.active.id);
    setActiveId(event.active.id);
    const foundTask = tasks.find((task) => task.id === event.active.id);
    console.log("Active task found in tasks array:", foundTask);
  };

  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === "todo"),
    inprogress: tasks.filter((task) => task.status === "inprogress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : null;

  if (status === "loading" || !project) {
    return <ProjectPageSkeleton />;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold flex items-center">
          <Folder className="mr-4 h-8 w-8" />
          {project.name}
        </h1>
                <Button onClick={() => router.push("/dashboard")}><ArrowLeft className="mr-2 h-4 w-4" />Retour au tableau de bord</Button>
      </div>

      <p className="text-lg text-muted-foreground mb-8">{project.description || "Aucune description fournie."}</p>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Tâches</h2>
        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
          <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" />Créer une nouvelle tâche</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              <DialogDescription>
                Entrez les détails de votre nouvelle tâche.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="taskTitle">Titre</Label>
                <Input
                  id="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskStatus">Statut</Label>
                <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
                  <SelectTrigger id="taskStatus">
                    <ListTodo className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">À faire</SelectItem>
                    <SelectItem value="inprogress">En cours</SelectItem>
                    <SelectItem value="done">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskPriority">Priorité</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger id="taskPriority">
                    <Signal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sélectionner la priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Basse</SelectItem>
                    <SelectItem value="MEDIUM">Moyenne</SelectItem>
                    <SelectItem value="HIGH">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskAssignee">Assigner à</Label>
                <Select onValueChange={setNewTaskAssigneeId} defaultValue={newTaskAssigneeId || undefined}>
                  <SelectTrigger id="taskAssignee">
                    <User className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Non assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Non assigné</SelectItem>
                    {tenantUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDueDate">Date d'échéance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !newTaskDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTaskDueDate ? format(newTaskDueDate, "PPP p", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={(day) => handleNewTaskDateTimeChange({ day })}
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <input 
                        type="time"
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        value={newTaskDueDate ? format(newTaskDueDate, 'HH:mm') : ''}
                        onChange={(e) => handleNewTaskDateTimeChange({ time: e.target.value })}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit">Créer la tâche</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="filterStatus">Statut:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filterStatus" className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="inprogress">En cours</SelectItem>
              <SelectItem value="done">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="filterPriority">Priorité:</Label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger id="filterPriority" className="w-[180px]">
              <Signal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              <SelectItem value="LOW">Basse</SelectItem>
              <SelectItem value="MEDIUM">Moyenne</SelectItem>
              <SelectItem value="HIGH">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>



        <div className="flex items-center gap-2">
          <Label htmlFor="sortBy">Trier par:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sortBy" className="w-[180px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date de création</SelectItem>
              <SelectItem value="title">Titre</SelectItem>
              <SelectItem value="priority">Priorité</SelectItem>
              <SelectItem value="status">Statut</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          className="flex gap-4 overflow-x-auto pb-4"
        >
          {(['todo', 'inprogress', 'done'] as const).map((statusColumn) => (
            <div key={statusColumn}>
              <DroppableColumn id={statusColumn} title={getTranslatedStatus(statusColumn)}>
                <SortableContext items={tasksByStatus[statusColumn].map(task => task.id)} strategy={verticalListSortingStrategy}>
                  {tasksByStatus[statusColumn].length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm p-4">
                      <Image
                        src="/file.svg"
                        alt="No tasks"
                        width={64}
                        height={64}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p>Aucune tâche ici.</p>
                    </div>
                  ) : (
                    tasksByStatus[statusColumn].map((task) => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        tenantUsers={tenantUsers}
                        onEdit={handleOpenEditDialog}
                        onDelete={handleDeleteTask}
                        onMarkAsDone={handleMarkAsDone}
                        onAssign={handleAssignTask}
                      />
                    ))
                  )}
                </SortableContext>
              </DroppableColumn>
            </div>
          ))}
        </div>
        {/* Overlay pour un retour visuel clair pendant le drag */}
        <DragOverlay>
          {activeTask ? (
            <Card className="opacity-90">
              <div className="flex items-start p-4">
                <div className="flex flex-col items-center pr-4 gap-2 pt-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                  {activeTask.status !== 'done' && (
                    <CircularTimer createdAt={activeTask.createdAt} dueDate={activeTask.dueDate} />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <CardTitle className={`text-sm font-medium leading-snug ${activeTask.status === 'done' ? "line-through text-muted-foreground" : ""}`}>
                      {activeTask.title}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activeTask.description || "Pas de description"}</p>
                </div>
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
            <DialogDescription>
              Apportez des modifications à votre tâche ici.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTask} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTaskTitle">Titre</Label>
              <Input
                id="editTaskTitle"
                value={editingTask?.title || ""}
                onChange={(e) =>
                  setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editTaskDescription">Description</Label>
              <Textarea
                id="editTaskDescription"
                value={editingTask?.description || ""}
                onChange={(e) =>
                  setEditingTask((prev) => (prev ? { ...prev, description: e.target.value } : null))
                }
              />
            </div>
                          <div className="grid gap-2">
                            <Label htmlFor="editTaskStatus">Statut</Label>
                            <Select
                              value={editingTask?.status || "todo"}
                              onValueChange={(value) =>
                                setEditingTask((prev) => (prev ? { ...prev, status: value } : null))
                              }
                            >
                              <SelectTrigger id="editTaskStatus">
                                <ListTodo className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Sélectionner le statut" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">À faire</SelectItem>
                                <SelectItem value="inprogress">En cours</SelectItem>
                                <SelectItem value="done">Terminé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>                          <div className="grid gap-2">
                            <Label htmlFor="editTaskPriority">Priorité</Label>
                            <Select
                              value={editingTask?.priority || "MEDIUM"}
                              onValueChange={(value) =>
                                setEditingTask((prev) => (prev ? { ...prev, priority: value } : null))
                              }
                            >
                              <SelectTrigger id="editTaskPriority">
                                <Signal className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Sélectionter la priorité" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Basse</SelectItem>
                                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                                <SelectItem value="HIGH">Haute</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                                          <div className="grid gap-2">
                                            <Label htmlFor="editTaskAssignee">Assigner à</Label>
                                            <Select
                                              value={editingTask?.assigneeId || "null"}
                                              onValueChange={(value) =>
                                                setEditingTask((prev) => (prev ? { ...prev, assigneeId: value === "null" ? null : value } : null))
                                              }
                                            >
                                              <SelectTrigger id="editTaskAssignee">
                                                <User className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Non assigné" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="null">Non assigné</SelectItem>
                                                {tenantUsers.map((user) => (
                                                  <SelectItem key={user.id} value={user.id}>
                                                    {user.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="grid gap-2">
                                            <Label htmlFor="editTaskDueDate">Date d'échéance</Label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant={"outline"}
                                                                        className={cn(
                                                                          "justify-start text-left font-normal",
                                                                          !editingTask?.dueDate && "text-muted-foreground"
                                                                        )}
                                                                      >
                                                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                                                    {editingTask?.dueDate && !isNaN(new Date(editingTask.dueDate).getTime()) ? format(new Date(editingTask.dueDate), "PPP p", { locale: fr }) : <span>Choisir une date</span>}
                                                                                                                  </Button>
                                                                                                                </PopoverTrigger>
                                                                                                                <PopoverContent className="w-auto p-0">
                                                                                                                  <Calendar
                                                                                                                    mode="single"
                                                                                                                    selected={editingTask?.dueDate ? new Date(editingTask.dueDate) : undefined}
                                                                                                                    onSelect={(day) => {
                                                                                                                      const newDate = editingTask?.dueDate && !isNaN(new Date(editingTask.dueDate).getTime()) ? new Date(editingTask.dueDate) : new Date();
                                                                                                                      if (day) {
                                                                                                                        newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
                                                                                                                        setEditingTask((prev) => (prev ? { ...prev, dueDate: newDate.toISOString() } : null));
                                                                                                                      }
                                                                                                                    }}
                                                                                                                    initialFocus
                                                                                                                  />
                                                                                                                  <div className="p-3 border-t border-border">
                                                                                                                    <input 
                                                                                                                      type="time"
                                                                                                                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                                                                                                      value={editingTask?.dueDate && !isNaN(new Date(editingTask.dueDate).getTime()) ? format(new Date(editingTask.dueDate), 'HH:mm') : ''}
                                                                                                                      onChange={(e) => {
                                                                                                                        const newDate = editingTask?.dueDate && !isNaN(new Date(editingTask.dueDate).getTime()) ? new Date(editingTask.dueDate) : new Date();
                                                                                                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                                                                                                        if (!isNaN(hours) && !isNaN(minutes)) {
                                                                                                                          newDate.setHours(hours, minutes, 0, 0);
                                                                                                                          setEditingTask((prev) => (prev ? { ...prev, dueDate: newDate.toISOString() } : null));
                                                                                                                        }
                                                                                                                      }}
                                                                                                                    />
                                                                                                                  </div>                                              </PopoverContent>
                                            </Popover>
                                          </div>            <Button type="submit">Enregistrer les modifications</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
