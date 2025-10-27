import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.tenantId) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const projectIds = projects.map(p => p.id);

    const taskCounts = await prisma.task.groupBy({
      by: ['projectId', 'status'],
      where: {
        projectId: {
          in: projectIds,
        },
      },
      _count: {
        id: true,
      },
    });

    const projectsWithStats = projects.map(project => {
      const totalTasks = taskCounts
        .filter(tc => tc.projectId === project.id)
        .reduce((acc, tc) => acc + tc._count.id, 0);
      const completedTasks = taskCounts
        .find(tc => tc.projectId === project.id && tc.status === 'done')?._count.id || 0;

      return {
        ...project,
        totalTasks,
        completedTasks,
      };
    });

    return NextResponse.json(projectsWithStats, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
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

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
