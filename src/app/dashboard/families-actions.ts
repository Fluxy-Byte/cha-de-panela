"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFamilyCode } from "@/lib/family-code";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Não autenticado.");
  }

  return session;
}

async function createUniqueFamilyCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateFamilyCode();
    const existing = await prisma.family.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Não foi possível gerar um código único. Tente novamente.");
}

export async function createFamily(principalName: string) {
  await requireSession();

  const name = principalName.trim();
  if (!name) {
    throw new Error("Informe o nome do principal.");
  }

  const code = await createUniqueFamilyCode();

  await prisma.family.create({
    data: {
      code,
      members: {
        create: { name, isPrincipal: true },
      },
    },
  });

  revalidatePath("/dashboard");
}

export async function addMember(
  familyId: string,
  name: string,
  isChild: boolean,
) {
  await requireSession();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Informe o nome da pessoa.");
  }

  await prisma.member.create({
    data: { familyId, name: trimmed, isPrincipal: false, isChild },
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

export async function toggleMemberIsChild(memberId: string, isChild: boolean) {
  await requireSession();

  await prisma.member.update({
    where: { id: memberId },
    data: { isChild },
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
