import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const inviteUserSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.tenantId || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, role } = inviteUserSchema.parse(body);

    // Check if user already exists globally
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (existingUser.tenantId === session.user.tenantId) {
        return NextResponse.json({ message: "Un utilisateur avec cet email existe déjà dans votre organisation." }, { status: 409 });
      } else {
        return NextResponse.json({ message: "Cet email est déjà utilisé par une autre organisation." }, { status: 409 });
      }
    }

    // Generate a temporary password (in a real app, this would be an invitation token sent via email)
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: session.user.tenantId,
        role,
        name: email.split('@')[0], // Default name from email
      },
    });

    // In a real application, you would send an invitation email here
    console.log(`Invitation email sent to ${newUser.email} with temporary password: ${temporaryPassword}`);

    return NextResponse.json({ message: "Utilisateur invité avec succès.", user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Erreur lors de l'invitation de l'utilisateur:", error);
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
  }
}
