import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]), // Ensure role is one of the defined enums
});

import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  // 1. Authentication and Authorization: Only ADMINs can change roles
  if (!session || !session.user || !session.user.tenantId || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { id: userIdToUpdate } = await context.params;

  if (!userIdToUpdate) {
    return NextResponse.json({ message: "ID utilisateur manquant dans l'URL" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { role: newRole } = updateUserRoleSchema.parse(body);

    // 2. Prevent Admin from changing their own role
    if (userIdToUpdate === session.user.id) {
      return NextResponse.json({ message: "Vous ne pouvez pas modifier votre propre rôle." }, { status: 403 });
    }

    // 3. Prevent changing the role of the last ADMIN in a tenant
    if (newRole === "MEMBER") {
      const adminUsersInTenant = await prisma.user.count({
        where: {
          tenantId: session.user.tenantId,
          role: "ADMIN",
        },
      });

      // If there's only one admin and it's the user we're trying to demote
      const userBeingDemotedIsAdmin = await prisma.user.findUnique({
        where: { id: userIdToUpdate },
        select: { role: true },
      });

      if (adminUsersInTenant === 1 && userBeingDemotedIsAdmin?.role === "ADMIN") {
        return NextResponse.json({ message: "Impossible de rétrograder le dernier administrateur du tenant." }, { status: 403 });
      }
    }

    // 4. Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate, tenantId: session.user.tenantId }, // Ensure user belongs to tenant
      data: { role: newRole },
    });

    return NextResponse.json({ message: "Rôle utilisateur mis à jour avec succès.", user: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Erreur lors de la mise à jour du rôle utilisateur:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}
