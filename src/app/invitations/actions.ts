"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  setFamilySessionCookie,
  clearFamilySessionCookie,
  getSessionFamilyId,
} from "@/lib/family-session";
import { calculateContributionValue } from "@/lib/pricing";
import { findOrCreateAsaasCustomer, createPixPayment } from "@/lib/asaas";

export async function validateFamilyCode(familyId: string, code: string) {
  const trimmedCode = code.trim().toUpperCase();
  if (!trimmedCode) {
    throw new Error("Informe o código recebido na mensagem.");
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family || family.code !== trimmedCode) {
    throw new Error("Código inválido. Confira a mensagem que você recebeu.");
  }

  await setFamilySessionCookie(family.id);
  revalidatePath("/invitations");
}

export async function resetFamilySelection() {
  await clearFamilySessionCookie();
  revalidatePath("/invitations");
}

export async function createProductPayment(giftId: string, cpf: string) {
  const familyId = await getSessionFamilyId();
  if (!familyId) {
    throw new Error("Sessão expirada. Selecione sua família novamente.");
  }

  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) {
    throw new Error("Informe um CPF válido.");
  }

  const [family, gift] = await Promise.all([
    prisma.family.findUniqueOrThrow({
      where: { id: familyId },
      include: { members: true },
    }),
    prisma.gift.findUniqueOrThrow({ where: { id: giftId } }),
  ]);

  const principal = family.members.find((member) => member.isPrincipal);
  if (!principal) {
    throw new Error("Família sem integrante principal cadastrado.");
  }

  const peopleCount = family.members.filter((member) => !member.isChild).length;
  const amount = calculateContributionValue(gift.minValue, peopleCount);

  const customerId = await findOrCreateAsaasCustomer(principal.name, cleanCpf);

  const pix = await createPixPayment({
    customerId,
    value: amount,
    externalReference: `${family.id}:${gift.id}:${Date.now()}`,
    description: `Chá de Panela · ${gift.name}`,
  });

  const payment = await prisma.payment.create({
    data: {
      familyId: family.id,
      giftId: gift.id,
      payerName: principal.name,
      payerCpf: cleanCpf,
      amount,
      asaasPaymentId: pix.paymentId,
      asaasCustomerId: customerId,
      pixPayload: pix.qrCodePayload,
      pixQrCode: pix.qrCodeImage,
    },
  });

  revalidatePath("/invitations");

  return {
    paymentId: payment.id,
    amount,
    qrCodeImage: pix.qrCodeImage,
    qrCodePayload: pix.qrCodePayload,
  };
}

export async function getPaymentStatus(paymentId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    select: { status: true },
  });
  return payment.status;
}
