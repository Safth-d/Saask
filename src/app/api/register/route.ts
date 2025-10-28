import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, tenantName, subdomain } = await req.json();

    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      return NextResponse.json(
        { message: "Sous-domaine déjà pris" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new tenant and user
    const newTenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        subdomain,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: "ADMIN", // Assign ADMIN role to the first user of the tenant
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Utilisateur et Tenant créés avec succès", tenant: newTenant },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        message: "Une erreur est survenue",
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}