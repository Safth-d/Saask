import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1, "Le nom ne peut pas être vide.").optional(),
  image: z.string().url("L'URL de l'image est invalide.").optional().or(z.literal("")),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        tenantId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, image } = updateUserSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image: image === "" ? null : image }),
      },
    });

    return NextResponse.json({ message: "Profil mis à jour avec succès.", user: updatedUser }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Erreur lors de la mise à jour du profil utilisateur:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}
