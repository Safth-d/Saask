import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // Adjust path as needed

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: "ID de tâche manquant dans l'URL" }, { status: 400 });
    }

    const { title, description, status, priority, assigneeId, dueDate } = await request.json();

    // First, verify the task exists and belongs to the user's tenant
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          tenantId: session.user.tenantId,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Tâche non trouvée ou non autorisée" }, { status: 404 });
    }

    // Construct the data for the update
    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (dueDate !== undefined) {
      dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // Special handling for the assignee relationship
    if (assigneeId !== undefined) {
      if (assigneeId === null) {
        // Disconnect the relationship if assigneeId is null
        dataToUpdate.assignee = { disconnect: true };
      } else {
        // Verify the assignee belongs to the same tenant
        const userExists = await prisma.user.findFirst({
          where: { id: assigneeId, tenantId: session.user.tenantId },
        });
        if (!userExists) {
          return NextResponse.json({ message: "Utilisateur assigné non valide" }, { status: 400 });
        }
        dataToUpdate.assignee = { connect: { id: assigneeId } };
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("API: Error updating task:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    const deletedTask = await prisma.task.deleteMany({
      where: {
        id,
        project: {
          tenantId: session.user.tenantId,
        },
      },
    });

    if (deletedTask.count === 0) {
      return NextResponse.json({ message: "Tâche non trouvée ou non autorisée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tâche supprimée", count: deletedTask.count }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
