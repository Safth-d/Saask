"use server";

import { revalidatePath } from "next/cache";

export async function revalidateUsersPath() {
  revalidatePath("/dashboard/users");
}
