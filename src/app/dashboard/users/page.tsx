import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserPlus, UserCog, Trash2, User, Mail, Shield, MoreHorizontal } from "lucide-react";
import { InviteUserDialog } from "@/components/invite-user-dialog";
import { EditUserRoleDialog } from "@/components/edit-user-role-dialog";
import { DeleteUserConfirmDialog } from "@/components/delete-user-confirm-dialog";
import { revalidateUsersPath } from "./actions";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function UsersPage() {
  const session = await getCurrentSession();

  if (!session || !session.user || !session.user.tenantId || session.user.role !== "ADMIN") {
    redirect("/dashboard"); // Only admins can access this page
  }

  const users = await prisma.user.findMany({
    where: {
      tenantId: session.user.tenantId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <InviteUserDialog onUserInvited={revalidateUsersPath}>
            <Button><UserPlus className="mr-2 h-4 w-4" />Inviter un utilisateur</Button>
          </InviteUserDialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead><User className="inline-block mr-2 h-4 w-4" />Nom</TableHead>
                <TableHead><Mail className="inline-block mr-2 h-4 w-4" />Email</TableHead>
                <TableHead><Shield className="inline-block mr-2 h-4 w-4" />Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <EditUserRoleDialog user={user} onRoleUpdated={revalidateUsersPath} currentUserSessionId={session.user.id}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <UserCog className="mr-2 h-4 w-4" />
                            <span>Modifier rôle</span>
                          </DropdownMenuItem>
                        </EditUserRoleDialog>
                        <DeleteUserConfirmDialog user={user} onUserDeleted={revalidateUsersPath} currentUserSessionId={session.user.id}>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Supprimer</span>
                          </DropdownMenuItem>
                        </DeleteUserConfirmDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
                      </Table>
                    </div>
                  </CardContent>      </Card>
    </div>
  );
}
