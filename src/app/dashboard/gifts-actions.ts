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

function assertValidGiftInput(name: string, value: number, minValue: number) {
  if (!name.trim()) {
    throw new Error("Informe o nome do presente.");
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Informe um valor válido.");
  }
  if (!Number.isInteger(minValue) || minValue <= 0) {
    throw new Error("Informe um valor mínimo válido (inteiro maior que zero).");
  }
}

export async function createGift(
  name: string,
  value: number,
  minValue: number,
  imageUrl: string,
) {
  await requireSession();

  const trimmed = name.trim();
  assertValidGiftInput(trimmed, value, minValue);

  await prisma.gift.create({
    data: { name: trimmed, value, minValue, imageUrl: imageUrl.trim() || null },
  });

  revalidatePath("/dashboard");
}

export async function updateGift(
  giftId: string,
  name: string,
  value: number,
  minValue: number,
  imageUrl: string,
) {
  await requireSession();

  const trimmed = name.trim();
  assertValidGiftInput(trimmed, value, minValue);

  await prisma.gift.update({
    where: { id: giftId },
    data: { name: trimmed, value, minValue, imageUrl: imageUrl.trim() || null },
  });

  revalidatePath("/dashboard");
}

export async function deleteGift(giftId: string) {
  await requireSession();

  await prisma.gift.delete({ where: { id: giftId } });

  revalidatePath("/dashboard");
}
