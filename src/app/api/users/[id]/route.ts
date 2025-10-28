import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  // 1. Authentication and Authorization: Only ADMINs can delete users
  if (!session || !session.user || !session.user.tenantId || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const { id: userIdToDelete } = await context.params;
  if (!userIdToDelete) {
    return NextResponse.json({ message: "ID utilisateur manquant" }, { status: 400 });
  }

  try {
    // 2. Prevent Admin from deleting themselves
    if (userIdToDelete === session.user.id) {
      return NextResponse.json({ message: "Vous ne pouvez pas vous supprimer vous-même." }, { status: 403 });
    }

    // 3. Prevent deleting the last ADMIN in a tenant
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { role: true, tenantId: true },
    });

    if (!userToDelete || userToDelete.tenantId !== session.user.tenantId) {
      return NextResponse.json({ message: "Utilisateur non trouvé ou non autorisé." }, { status: 404 });
    }

    if (userToDelete.role === "ADMIN") {
      const adminUsersInTenant = await prisma.user.count({
        where: {
          tenantId: session.user.tenantId,
          role: "ADMIN",
        },
      });

      if (adminUsersInTenant === 1) {
        return NextResponse.json({ message: "Impossible de supprimer le dernier administrateur du tenant." }, { status: 403 });
      }
    }

    // 4. Delete the user
    await prisma.user.delete({
      where: { id: userIdToDelete, tenantId: session.user.tenantId }, // Ensure user belongs to tenant
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}
