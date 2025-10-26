import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
          <InviteUserDialog onUserInvited={revalidateUsersPath} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
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
                  <TableCell className="text-right flex gap-2 justify-end">
                    <EditUserRoleDialog user={user} onRoleUpdated={revalidateUsersPath} currentUserSessionId={session.user.id} />
                    <DeleteUserConfirmDialog user={user} onUserDeleted={revalidateUsersPath} currentUserSessionId={session.user.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
