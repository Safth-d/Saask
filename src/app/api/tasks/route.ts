import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route"; // Adjust path as needed

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const statusFilter = searchParams.get("status");
    const priorityFilter = searchParams.get("priority");
    const completedFilter = searchParams.get("completed");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" || "desc";

    const whereClause: any = {
      project: {
        tenantId: session.user.tenantId,
        ...(projectId && { id: projectId }),
      },
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    if (priorityFilter) {
      whereClause.priority = priorityFilter;
    }
    if (completedFilter !== null) { // Check for null to allow 'true' or 'false'
      whereClause.completed = completedFilter === "true";
    }

    let orderByClause: any = { createdAt: "desc" }; // Default sort

    if (sortBy) {
      switch (sortBy) {
        case "title":
          orderByClause = { title: sortOrder };
          break;
        case "createdAt":
          orderByClause = { createdAt: sortOrder };
          break;
        case "priority":
          orderByClause = { priority: sortOrder };
          break;
        case "status":
          orderByClause = { status: sortOrder };
          break;
        // Add more sorting options as needed
        default:
          orderByClause = { createdAt: "desc" };
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
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
      orderBy: orderByClause,
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { title, description, projectId, status, priority, assigneeId, dueDate } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json(
        { message: "Le titre de la tâche et l'ID du projet sont requis" },
        { status: 400 }
      );
    }

    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: session.user.tenantId,
      },
    });

    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        status: status || "todo",
        priority: priority || "MEDIUM",
        ...(assigneeId && { assigneeId }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
