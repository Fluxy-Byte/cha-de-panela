"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Não autenticado.");
  }

  return session;
}

export async function createGift(
  name: string,
  value: number,
  imageUrl: string,
) {
  await requireSession();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe o nome do presente.");
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Informe um valor válido.");
  }

  await prisma.gift.create({
    data: { name: trimmed, value, imageUrl: imageUrl.trim() || null },
  });

  revalidatePath("/dashboard");
}

export async function updateGift(
  giftId: string,
  name: string,
  value: number,
  imageUrl: string,
) {
  await requireSession();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe o nome do presente.");
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Informe um valor válido.");
  }

  await prisma.gift.update({
    where: { id: giftId },
    data: { name: trimmed, value, imageUrl: imageUrl.trim() || null },
  });

  revalidatePath("/dashboard");
}

export async function deleteGift(giftId: string) {
  await requireSession();

  await prisma.gift.delete({ where: { id: giftId } });

  revalidatePath("/dashboard");
}
