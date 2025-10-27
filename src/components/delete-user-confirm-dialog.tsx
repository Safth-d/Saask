"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

import { ReactNode } from "react";

interface DeleteUserConfirmDialogProps {
  user: { id: string; name: string | null; email: string | null; role: string };
  onUserDeleted: () => void;
  currentUserSessionId: string;
  children: ReactNode;
}

export function DeleteUserConfirmDialog({ user, onUserDeleted, currentUserSessionId, children }: DeleteUserConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteUser = async () => {
    setIsSubmitting(true);

    if (user.id === currentUserSessionId) {
      toast.error("Vous ne pouvez pas vous supprimer vous-même.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setIsOpen(false);
        onUserDeleted();
      } else {
        toast.error(data.message || "Échec de la suppression de l'utilisateur.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur réseau lors de la suppression de l'utilisateur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'utilisateur {user.name || user.email} ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Annuler</Button>
          <Button variant="destructive" onClick={handleDeleteUser} disabled={isSubmitting}>
            {isSubmitting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
