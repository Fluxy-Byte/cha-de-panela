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

export async function createFamily(principalName: string) {
  await requireSession();

  const name = principalName.trim();
  if (!name) {
    throw new Error("Informe o nome do principal.");
  }

  await prisma.family.create({
    data: {
      members: {
        create: { name, isPrincipal: true },
      },
    },
  });

  revalidatePath("/dashboard");
}

export async function chooseGiftForFamily(familyId: string, giftId: string) {
  await requireSession();

  const gift = await prisma.gift.findUniqueOrThrow({ where: { id: giftId } });
  if (gift.claimedByFamilyId && gift.claimedByFamilyId !== familyId) {
    throw new Error("Este presente já foi escolhido por outra família.");
  }

  await prisma.$transaction([
    prisma.gift.updateMany({
      where: { claimedByFamilyId: familyId },
      data: { claimedByFamilyId: null },
    }),
    prisma.gift.update({
      where: { id: giftId },
      data: { claimedByFamilyId: familyId },
    }),
    prisma.family.update({
      where: { id: familyId },
      data: { cashAmount: null },
    }),
  ]);

  revalidatePath("/dashboard");
}

export async function clearFamilyGiftChoice(familyId: string) {
  await requireSession();

  await prisma.gift.updateMany({
    where: { claimedByFamilyId: familyId },
    data: { claimedByFamilyId: null },
  });

  revalidatePath("/dashboard");
}

export async function setFamilyCashAmount(
  familyId: string,
  amount: number | null,
) {
  await requireSession();

  await prisma.$transaction([
    prisma.gift.updateMany({
      where: { claimedByFamilyId: familyId },
      data: { claimedByFamilyId: null },
    }),
    prisma.family.update({
      where: { id: familyId },
      data: { cashAmount: amount },
    }),
  ]);

  revalidatePath("/dashboard");
}

export async function addMember(familyId: string, name: string) {
  await requireSession();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe o nome da pessoa.");
  }

  await prisma.member.create({
    data: { familyId, name: trimmed, isPrincipal: false },
  });

  revalidatePath("/dashboard");
}

export async function renameMember(memberId: string, name: string) {
  await requireSession();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe um nome válido.");
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { name: trimmed },
  });

  revalidatePath("/dashboard");
}

export async function setPrincipal(familyId: string, memberId: string) {
  await requireSession();

  await prisma.$transaction([
    prisma.member.updateMany({
      where: { familyId },
      data: { isPrincipal: false },
    }),
    prisma.member.update({
      where: { id: memberId },
      data: { isPrincipal: true },
    }),
  ]);

  revalidatePath("/dashboard");
}

export async function deleteMember(memberId: string) {
  await requireSession();

  const member = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
  });

  if (member.isPrincipal) {
    throw new Error(
      "Altere o integrante principal antes de excluir este integrante, ou exclua a família inteira.",
    );
  }

  await prisma.member.delete({ where: { id: memberId } });

  revalidatePath("/dashboard");
}

export async function deleteFamily(familyId: string) {
  await requireSession();

  await prisma.family.delete({ where: { id: familyId } });

  revalidatePath("/dashboard");
}
