import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // Adjust path as needed

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  console.log("API: GET /api/projects/[id] called"); // Added log
  try {
    const session = await getServerSession(authOptions);
    console.log("API: Session:", session); // Added log

    if (!session || !session.user || !session.user.tenantId) {
    const { id } = context.params; // Corrected
    console.log("API: Project ID:", id, "Tenant ID:", session.user.tenantId); // Added log

    const project = await prisma.project.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });
    console.log("API: Project found:", project); // Added log

    if (!project) {
      console.log("API: Project not found for ID:", id); // Added log
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("API: Error fetching project:", error); // Modified log
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      console.log("API: Unauthorized access - no session or tenantId");
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = context.params; // Corrected
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.updateMany({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      data: {
        name,
        description,
      },
    });

    if (updatedProject.count === 0) {
      return NextResponse.json({ message: "Projet non trouvé ou non autorisé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Projet mis à jour", count: updatedProject.count }, { status: 200 });
  } catch (error) {
    console.error("API: Error updating project:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      console.log("API: Unauthorized access - no session or tenantId");
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = context.params; // Corrected

    const deletedProject = await prisma.project.deleteMany({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (deletedProject.count === 0) {
      return NextResponse.json({ message: "Projet non trouvé ou non autorisé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Projet supprimé", count: deletedProject.count }, { status: 200 });
  } catch (error) {
    console.error("API: Error deleting project:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}