"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EditUserRoleDialogProps {
  user: { id: string; name: string | null; email: string | null; role: string };
  onRoleUpdated: () => void;
  currentUserSessionId: string;
}

export function EditUserRoleDialog({ user, onRoleUpdated, currentUserSessionId }: EditUserRoleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (user.id === currentUserSessionId) {
      toast.error("Vous ne pouvez pas modifier votre propre rôle.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setIsOpen(false);
        onRoleUpdated();
      } else {
        toast.error(data.message || "Échec de la mise à jour du rôle.");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Erreur réseau lors de la mise à jour du rôle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Modifier rôle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le rôle de {user.name || user.email}</DialogTitle>
          <DialogDescription>Sélectionnez le nouveau rôle pour cet utilisateur.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateRole}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Rôle</Label>
              <Select value={newRole} onValueChange={setNewRole} disabled={isSubmitting}>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membre</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour..." : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
