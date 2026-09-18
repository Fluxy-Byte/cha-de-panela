import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CONFIRMING_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);

type AsaasWebhookBody = {
  event?: string;
  payment?: { id?: string };
};

export async function POST(request: NextRequest) {
  const token = request.headers.get("access_token");
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as AsaasWebhookBody;
  const event = body.event;
  const asaasPaymentId = body.payment?.id;

  if (!event || !asaasPaymentId || !CONFIRMING_EVENTS.has(event)) {
    return NextResponse.json({ received: true });
  }

  const payment = await prisma.payment.findUnique({
    where: { asaasPaymentId },
  });

  if (payment && payment.status !== "CONFIRMED") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      }),
      prisma.gift.update({
        where: { id: payment.giftId },
        data: { raisedAmount: { increment: payment.amount } },
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
