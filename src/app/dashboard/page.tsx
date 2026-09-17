import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FamiliesSection } from "@/components/dashboard/families-section";
import { GiftsSection } from "@/components/dashboard/gifts-section";

export default async function DashboardPage() {
  const user = await requireUser();

  const [families, gifts] = await Promise.all([
    prisma.family.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          orderBy: [{ isPrincipal: "desc" }, { createdAt: "asc" }],
        },
        claimedGift: {
          select: { id: true, name: true, value: true, imageUrl: true },
        },
      },
    }),
    prisma.gift.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        claimedByFamily: {
          include: {
            members: { where: { isPrincipal: true }, take: 1 },
          },
        },
      },
    }),
  ]);

  const giftOptions = gifts.map((gift) => ({
    id: gift.id,
    name: gift.name,
    value: gift.value,
    imageUrl: gift.imageUrl,
    claimedByFamilyId: gift.claimedByFamilyId,
  }));

  const giftDTOs = gifts.map((gift) => ({
    id: gift.id,
    name: gift.name,
    value: gift.value,
    imageUrl: gift.imageUrl,
    claimedByFamilyName: gift.claimedByFamily?.members[0]?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Olá, {user.name || user.email}
        </h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo(a) ao painel do Chá de Panela.
        </p>
      </div>

      <GiftsSection gifts={giftDTOs} />
      <FamiliesSection families={families} gifts={giftOptions} />
    </div>
  );
}
